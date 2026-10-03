import {createRemoteJWKSet, customFetch, jwtVerify} from 'jose';

const SESSION = '__Host-atlas-session', OAUTH = '__Host-atlas-oauth';
const SESSION_SECONDS = 30 * 24 * 60 * 60, STATE_SECONDS = 600;
const now = () => Math.floor(Date.now() / 1000);
const base64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const random = () => base64url(crypto.getRandomValues(new Uint8Array(32)));
const hash = async value => base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
const cookie = (name, value, seconds) => `${name}=${value}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=Lax`;
const readCookie = (request, name) => request.headers.get('Cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='))?.slice(name.length + 1) || '';
const validToken = value => /^[A-Za-z0-9_-]{43}$/.test(value);
const headers = {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'};
const json = (data, status = 200) => Response.json(data, {status, headers});
function redirect(path, cookies = []) {
 const response = new Response(null, {status: 302, headers: {...headers, Location: path}});
 for (const value of cookies) response.headers.append('Set-Cookie', value);
 return response;
}
function returnPath(value) {
 // Fixed destinations prevent open redirects, including encoded/backslash variants.
 return ['/', '/profile', '/account-settings', '/?bag=1', '/?coach=1'].includes(value) ? value : '/';
}
async function body(request) {
 if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('Send JSON.');
 if (Number(request.headers.get('Content-Length')) > 4096) throw new Error('Request is too large.');
 const reader = request.body?.getReader();
 if (!reader) throw new Error('Request is empty.');
 let size = 0, text = '';const decoder = new TextDecoder();
 while (true) {
  const {done, value} = await reader.read();if (done) break;
  size += value.length;if (size > 4096) {await reader.cancel();throw new Error('Request is too large.');}
  text += decoder.decode(value, {stream: true});
 }
 const data = JSON.parse(text + decoder.decode());
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Send an object.');
 return data;
}

export function createAuth({googleFetch = (...args) => fetch(...args)} = {}) {
 const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), {[customFetch]: googleFetch});
 async function session(request, env) {
  const token = readCookie(request, SESSION);if (!validToken(token)) return null;
  return env.DB.prepare(`SELECT s.token_hash, s.csrf_token, u.id, u.display_name, u.email
   FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id
   WHERE s.token_hash=? AND s.expires_at>?`).bind(await hash(token), now()).first();
 }
 function account(user, env) {
  return {provider: 'google', user: user ? {name: user.display_name, email: user.email} : null,
   csrfToken: user?.csrf_token || null, authReady: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
   signInUrl: '/signin', signOutUrl: '/auth/signout', bagReady: !!env.DB, coachReady: !!(env.AI || (env.COACH_PROVIDER === 'openai' && env.OPENAI_API_KEY)), bag: [], profile: null};
 }
 async function start(request, env) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return redirect('/signin?auth_error=unconfigured');
  const url = new URL(request.url), state = random(), browser = random(), nonce = random(), verifier = random();
  await env.DB.batch([
   env.DB.prepare('DELETE FROM auth_oauth_states WHERE expires_at<=?').bind(now()),
   env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(now()),
   env.DB.prepare('INSERT INTO auth_oauth_states(state_hash,browser_hash,nonce,verifier,return_to,expires_at) VALUES (?,?,?,?,?,?)')
    .bind(await hash(state), await hash(browser), nonce, verifier, returnPath(url.searchParams.get('return_to')), now() + STATE_SECONDS),
  ]);
  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorization.search = new URLSearchParams({client_id: env.GOOGLE_CLIENT_ID, response_type: 'code',
   redirect_uri: url.origin + '/auth/google/callback', scope: 'openid email profile', state, nonce,
   code_challenge: await hash(verifier), code_challenge_method: 'S256', prompt: 'select_account'}).toString();
  return redirect(authorization.href, [cookie(OAUTH, browser, STATE_SECONDS)]);
 }
 async function callback(request, env) {
  const clear = cookie(OAUTH, '', 0), failure = () => redirect('/signin?auth_error=failed', [clear]);
  const url = new URL(request.url), state = url.searchParams.get('state'), browser = readCookie(request, OAUTH);
  if (!validToken(state || '') || !validToken(browser) || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return failure();
  // Consume atomically before contacting Google; a state is bound to one browser and one attempt.
  const pending = await env.DB.prepare(`DELETE FROM auth_oauth_states WHERE state_hash=? AND browser_hash=? AND expires_at>?
   RETURNING nonce,verifier,return_to`).bind(await hash(state), await hash(browser), now()).first();
  if (!pending) return failure();
  if (url.searchParams.get('error') || !url.searchParams.get('code')) return redirect('/signin?auth_error=cancelled', [clear]);
  try {
   const tokenResponse = await googleFetch('https://oauth2.googleapis.com/token', {method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}, signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
     code: url.searchParams.get('code'), code_verifier: pending.verifier, grant_type: 'authorization_code',
     redirect_uri: url.origin + '/auth/google/callback'}).toString()});
   if (!tokenResponse.ok) return failure();
   const tokens = await tokenResponse.json();
   const {payload} = await jwtVerify(tokens.id_token, keys, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: env.GOOGLE_CLIENT_ID,
    algorithms: ['RS256'], requiredClaims: ['exp', 'iat', 'sub', 'nonce', 'email', 'email_verified'], maxTokenAge: '10m',
   });
   if (payload.nonce !== pending.nonce || payload.email_verified !== true ||
    typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 255 ||
    typeof payload.email !== 'string' || !payload.email.includes('@') || payload.email.length > 320 ||
    (payload.azp && payload.azp !== env.GOOGLE_CLIENT_ID) ||
    (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== env.GOOGLE_CLIENT_ID)) return failure();
   const name = (typeof payload.name === 'string' && payload.name.trim() || payload.email.split('@')[0]).slice(0, 80);
   // Identify by Google's immutable subject, never by mutable email/name. Preserve name edits.
   await env.DB.prepare(`INSERT INTO auth_users(id,google_sub,email,display_name,created_at,updated_at) VALUES (?,?,?,?,?,?)
    ON CONFLICT(google_sub) DO UPDATE SET email=excluded.email,updated_at=excluded.updated_at`)
    .bind(crypto.randomUUID(), payload.sub, payload.email, name, now(), now()).run();
   const user = await env.DB.prepare('SELECT id FROM auth_users WHERE google_sub=?').bind(payload.sub).first();
   const token = random(), statements = [], previous = readCookie(request, SESSION);
   if (validToken(previous)) statements.push(env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await hash(previous)));
   statements.push(env.DB.prepare('INSERT INTO auth_sessions(token_hash,user_id,csrf_token,expires_at) VALUES (?,?,?,?)')
    .bind(await hash(token), user.id, random(), now() + SESSION_SECONDS));
   await env.DB.batch(statements);
   return redirect(pending.return_to, [clear, cookie(SESSION, token, SESSION_SECONDS)]);
  } catch {
   // Never include codes, tokens, provider responses or secrets in logs/errors.
   return failure();
  }
 }
 async function write(request, env, path) {
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error: 'Request origin was not accepted.'}, 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error: 'Send JSON.'}, 415);
  const user = await session(request, env);if (!user) return json({error: 'Sign in to continue.'}, 401);
  if (request.headers.get('X-Atlas-CSRF') !== user.csrf_token) return json({error: 'Refresh the page and try again.'}, 403);
  if (path === '/auth/signout') {
   await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(user.token_hash).run();
   const response = json({signedOut: true});response.headers.append('Set-Cookie', cookie(SESSION, '', 0));return response;
  }
  let data;try {data = await body(request);} catch {return json({error: 'Send a valid account update (up to 4 KB).'}, 400);}
  if (request.method === 'PUT') {
   if (typeof data.displayName !== 'string' || !data.displayName.trim() || data.displayName.trim().length > 80 || /[\u0000-\u001f\u007f]/.test(data.displayName))
    return json({error: 'Choose a display name between 1 and 80 characters.'}, 400);
   const name = data.displayName.trim();
   await env.DB.prepare('UPDATE auth_users SET display_name=?,updated_at=? WHERE id=?').bind(name, now(), user.id).run();
   return json(account({...user, display_name: name}, env));
  }
  if (data.confirmation !== 'DELETE') return json({error: 'Type DELETE to confirm account deletion.'}, 400);
  // Foreign-key cascade revokes every session for this account in the same statement.
  await env.DB.prepare('DELETE FROM auth_users WHERE id=?').bind(user.id).run();
  const response = json({deleted: true});response.headers.append('Set-Cookie', cookie(SESSION, '', 0));return response;
 }
 return {
  session,
  async fetch(request, env) {
   const path = new URL(request.url).pathname;
   if (!env.DB) return json({error: 'Account storage is unavailable. Please try again.'}, 503);
   try {
    if (path === '/api/account' && request.method === 'GET') return json(account(await session(request, env), env));
    if (path === '/auth/google/start' && request.method === 'GET') return await start(request, env);
    if (path === '/auth/google/callback' && request.method === 'GET') return await callback(request, env);
    if ((path === '/api/account' && ['PUT', 'DELETE'].includes(request.method)) || (path === '/auth/signout' && request.method === 'POST')) return await write(request, env, path);
    return json({error: 'Method not allowed.'}, 405);
   } catch (error) {
    // Log only a fixed category and known table name, never SQL bindings or secrets.
    const message = [error?.message, error?.cause?.message].filter(Boolean).join(' ');
    const table = /no such table:\s*(auth_users|auth_sessions|auth_oauth_states)\b/.exec(message)?.[1];
    console.error('Account request failed', {path, reason: table ? 'missing-account-table' : 'account-storage-error', ...(table ? {table} : {})});
    return json({error: 'Account storage is unavailable. Please try again.'}, 503);
   }
  },
 };
}
