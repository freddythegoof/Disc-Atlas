import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import * as publicWorker from '../workers/public.mjs';

// Execute real SQLite, including foreign keys and prepared bindings, like D1.
function database(){
 const db=new DatabaseSync(':memory:');
 db.exec(fs.readFileSync('migrations/accounts/0001_google_accounts.sql','utf8'));
 const prepare=sql=>{
  let values=[];
  const statement={bind(...args){values=args;return statement;},async first(){return db.prepare(sql).get(...values)||null;},async all(){return {results:db.prepare(sql).all(...values)};},async run(){return {meta:{changes:db.prepare(sql).run(...values).changes}};}};
  return statement;
 };
 return {prepare,async batch(statements){db.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}},close(){db.close();}};
}

test('public account endpoint ignores forged identity headers and reports a signed-out session',async()=>{
 const DB=database();
 try{
  const response=await publicWorker.default.fetch(new Request('https://atlas.example/api/account',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'forged@example.com'}}),{DB});
  assert.equal(response.status,200);
  const account=await response.json();assert.equal(account.user,null);assert.equal(account.provider,'google');assert.equal(account.coachReady,false);assert.equal(account.bagReady,true);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
 }finally{DB.close();}
});

test('a missing local accounts migration produces a safe, useful Worker diagnostic',async()=>{
 const calls=[],original=console.error;
 console.error=(...args)=>calls.push(args);
 const DB={prepare(){return {bind(){return this;},run(){throw new Error('D1_ERROR: no such table: auth_oauth_states');}};},async batch(statements){for(const s of statements)await s.run();}};
 try{
  const response=await publicWorker.default.fetch(new Request('https://atlas.example/auth/google/start'),{DB,GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'secret-that-must-never-appear-in-logs'});
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/storage is unavailable/);
  assert.deepEqual(calls,[['Account request failed',{path:'/auth/google/start',reason:'missing-account-table',table:'auth_oauth_states'}]]);
  assert.ok(!JSON.stringify(calls).includes('secret-that-must-never-appear-in-logs'));
 }finally{console.error=original;}
});

test('Google callback, session rotation, editing, CSRF, sign-out and account deletion',async()=>{
 const {SignJWT,generateKeyPair,exportJWK}=await import('jose');
 const {privateKey,publicKey}=await generateKeyPair('RS256');const jwk={...await exportJWK(publicKey),kid:'test-key',alg:'RS256',use:'sig'};
 const otherKeys=await generateKeyPair('RS256');
 let claims={},tokenFailure=false,tokenFault={};
 const googleFetch=async(input,options={})=>{
  const url=String(input);
  if(url==='https://www.googleapis.com/oauth2/v3/certs')return Response.json({keys:[jwk]});
  assert.equal(url,'https://oauth2.googleapis.com/token');
  const form=new URLSearchParams(options.body);assert.equal(form.get('client_secret'),'test-only-secret');assert.equal(form.get('grant_type'),'authorization_code');assert.ok(form.get('code_verifier').length>=43);
  if(tokenFailure)return Response.json({error:'invalid_grant'},{status:400});
  const id_token=await new SignJWT({email:'player@example.com',email_verified:true,name:'Atlas Player',...claims,...tokenFault.claims}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer(tokenFault.issuer||'https://accounts.google.com').setAudience(tokenFault.audience||'test-client').setSubject(claims.sub||'google-user-a').setIssuedAt(tokenFault.issuedAt).setExpirationTime(tokenFault.expiration||'5m').sign(tokenFault.signer||privateKey);
  return Response.json({id_token});
 };
 const worker=publicWorker.createPublicWorker({googleFetch}),DB=database(),env={DB,GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-only-secret'};
 const call=(path,{method='GET',cookie='',csrf='',body,origin='https://atlas.example'}={})=>worker.fetch(new Request('https://atlas.example'+path,{method,headers:{Cookie:cookie,...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json','X-Atlas-CSRF':csrf})},...(body===undefined?{}:{body:JSON.stringify(body)})}),env);
 const start=async()=>{
  const r=await call('/auth/google/start?return_to=https://evil.example');assert.equal(r.status,302);
  const url=new URL(r.headers.get('Location'));assert.equal(url.origin,'https://accounts.google.com');assert.equal(url.searchParams.get('scope'),'openid email profile');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  const cookie=r.headers.get('Set-Cookie');assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/);claims={nonce:url.searchParams.get('nonce')};
  return {state:url.searchParams.get('state'),cookie:cookie.split(';')[0]};
 };
 const finish=({state,cookie})=>call('/auth/google/callback?code=provider-code&state='+state,{cookie});
 const login=async(previous='')=>{const s=await start(),r=await finish({...s,cookie:[s.cookie,previous].filter(Boolean).join('; ')});assert.equal(r.status,302);assert.equal(r.headers.get('Location'),'/');const c=r.headers.getSetCookie().find(v=>v.startsWith('__Host-atlas-session='));assert.match(c,/Secure; HttpOnly; SameSite=Lax/);return {state:s,cookie:c.split(';')[0]};};
 try{
  const initial=await start();assert.equal((await finish({...initial,cookie:''})).status,302);assert.equal((await call('/api/account')).status,200);
  claims.nonce='wrong';const rejected=await finish(initial);assert.match(rejected.headers.get('Location'),/auth_error/);assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM auth_users').first()).n,0);
  for(const fault of [{claims:{email_verified:false}},{issuer:'https://evil.example'},{audience:'other-client'},{expiration:'-5m'},{issuedAt:Math.floor(Date.now()/1000)-900},{signer:otherKeys.privateKey},{claims:{azp:'other-client'}},{audience:['test-client','other-client']}]){
   tokenFault=fault;assert.match((await finish(await start())).headers.get('Location'),/auth_error/,'Invalid Google signature or claims cannot create a session');
   assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM auth_users').first()).n,0);
  }
  tokenFault={};
  const {cookie,state}=await login(),account=await (await call('/api/account',{cookie})).json();assert.equal(account.user.email,'player@example.com');assert.equal(account.user.name,'Atlas Player');assert.ok(account.csrfToken);
  assert.match((await finish(state)).headers.get('Location'),/auth_error/,'OAuth state cannot be replayed');
  const write={cookie,csrf:account.csrfToken,method:'PUT',body:{displayName:'  New Name  '}};
  assert.equal((await call('/api/account', {...write,origin:'https://evil.example'})).status,403);
  assert.equal((await call('/api/account',{...write,csrf:''})).status,403);
  assert.equal((await call('/api/account',{...write,body:{displayName:' '}})).status,400);
  assert.equal((await call('/api/account',write)).status,200);
  assert.equal((await (await call('/api/account',{cookie})).json()).user.name,'New Name');
  let second=await login();assert.equal((await (await call('/api/account',{cookie:second.cookie})).json()).user.name,'New Name','Returning Google sign-in preserves edited name');
  const oldSecond=second;second=await login(oldSecond.cookie);
  assert.equal((await (await call('/api/account',{cookie:oldSecond.cookie})).json()).user,null,'Reauthentication rotates the existing browser session');
  assert.equal((await call('/auth/signout',{cookie,csrf:account.csrfToken,method:'POST'})).status,200);
  assert.equal((await (await call('/api/account',{cookie})).json()).user,null);
  assert.ok((await (await call('/api/account',{cookie:second.cookie})).json()).user,'Sign-out only revokes this session');
  const current=await (await call('/api/account',{cookie:second.cookie})).json();
  const deletion={cookie:second.cookie,csrf:current.csrfToken,method:'DELETE',body:{confirmation:'NO'}};
  assert.equal((await call('/api/account',deletion)).status,400);
  assert.equal((await call('/api/account',{...deletion,body:{confirmation:'DELETE'}})).status,200);
  assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM auth_users').first()).n,0);assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM auth_sessions').first()).n,0);
  assert.equal((await (await call('/api/account',{cookie:second.cookie})).json()).user,null);
  tokenFailure=true;assert.match((await finish(await start())).headers.get('Location'),/auth_error/);
 }finally{DB.close();}
});

test('expired and forged sessions cannot read identity or mutate an account',async()=>{
 const DB=database(),env={DB};
 try{
  const token=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
  const digest=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('base64url');
  await DB.prepare('INSERT INTO auth_users VALUES (?,?,?,?,?,?)').bind('u1','google-1','private@example.com','Private User',1,1).run();
  await DB.prepare('INSERT INTO auth_sessions VALUES (?,?,?,?)').bind(digest,'u1','csrf',1).run();
  for(const cookie of ['__Host-atlas-session='+token,'__Host-atlas-session='+'a'.repeat(43)]){
   const response=await publicWorker.default.fetch(new Request('https://atlas.example/api/account',{headers:{Cookie:cookie}}),env);
   assert.equal((await response.json()).user,null);
   const update=await publicWorker.default.fetch(new Request('https://atlas.example/api/account',{method:'PUT',headers:{Cookie:cookie,Origin:'https://atlas.example','Content-Type':'application/json','X-Atlas-CSRF':'csrf'},body:'{"displayName":"Changed"}'}),env);
   assert.equal(update.status,401);
  }
  assert.equal((await DB.prepare('SELECT display_name FROM auth_users WHERE id=?').bind('u1').first()).display_name,'Private User');
 }finally{DB.close();}
});
