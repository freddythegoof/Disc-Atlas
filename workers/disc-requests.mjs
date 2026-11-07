// "Don't see a disc?" tips (docs/disc-request-form.md). No account is required, so the Worker bounds the input itself.
// A request is a tip for human review: this module never touches the catalog and has no read route.
const HOURLY_LIMIT = 5, MAX_BYTES = 8192, HOUR_SECONDS = 3600;
const LENGTHS = {discName: 120, manufacturer: 80, link: 500, note: 500, email: 254};
// validate_data.py bounds only speed. The others are the catalog's span, one wider each way, so a real new mold passes.
const FLIGHT = {speed: [0, 15], glide: [0, 8], turn: [-6, 3], fade: [0, 7]};
const LINE_BREAKING = /[\u0000-\u001f\u007f]/, CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const headers = {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'};
const json = (data, status = 200, extra = {}) => Response.json(data, {status, headers: {...headers, ...extra}});
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');

async function readBody(request) {
 if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new Error('Request too large');
 const reader = request.body?.getReader(); if (!reader) throw new Error('Empty request');
 let bytes = 0, text = ''; const decoder = new TextDecoder();
 while (true) {const {done, value} = await reader.read(); if (done) break; bytes += value.length; if (bytes > MAX_BYTES) {await reader.cancel(); throw new Error('Request too large');} text += decoder.decode(value, {stream: true});}
 const data = JSON.parse(text + decoder.decode());
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Send an object');
 return data;
}

function isHttpUrl(value) {
 try {const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname;} catch {return false;}
}

// Returns the row to store, or per-field messages the sheet shows beside each input.
export function validateRequest(data) {
 const fields = {}, text = name => {
  const value = data[name] == null ? '' : data[name];
  if (typeof value !== 'string') {fields[name] = 'Enter this as text.'; return '';}
  if (value.trim().length > LENGTHS[name]) fields[name] = `Keep this to ${LENGTHS[name]} characters.`;
  return value.trim();
 };
 const discName = text('discName'), manufacturer = text('manufacturer'), link = text('link'), note = text('note'), email = text('email');
 if (!discName) fields.discName = 'Enter the disc’s name.';
 if (!manufacturer) fields.manufacturer = 'Choose a manufacturer, or Other.';
 for (const [name, value] of [['discName', discName], ['manufacturer', manufacturer], ['link', link], ['email', email]]) if (!fields[name] && LINE_BREAKING.test(value)) fields[name] = 'Remove the line breaks and control characters.';
 if (!fields.note && CONTROL.test(note)) fields.note = 'Remove the control characters.';
 if (!fields.link && link && !isHttpUrl(link)) fields.link = 'Enter a full link starting with http:// or https://.';
 if (!fields.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Enter a valid email, or leave this empty.';

 const given = Object.keys(FLIGHT).filter(name => data[name] != null && data[name] !== '');
 const flight = Object.fromEntries(Object.keys(FLIGHT).map(name => [name, null]));
 if (given.length && given.length < 4) fields.flight = 'Enter all four flight numbers, or leave them all empty.';
 else if (given.length) {
  for (const name of given) {
   const value = data[name], [min, max] = FLIGHT[name];
   if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (name === 'speed' && value === 0)) {
    fields.flight = 'Speed runs above 0 to 15, glide 0 to 8, turn −6 to 3 and fade 0 to 7.'; break;
   }
   flight[name] = value;
  }
 }
 return Object.keys(fields).length ? {fields} : {row: {discName, manufacturer, ...flight, link: link || null, note: note || null, email: email || null}};
}

export function createDiscRequests({discRequestNow = () => Date.now()} = {}) {
 return {async fetch(request, env) {
  if (request.method !== 'POST') return json({error: 'Method not allowed.'}, 405);
  if (!env.DB) return json({error: 'Your request could not be saved. Please try again.'}, 503);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error: 'Request origin was not accepted.'}, 403);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error: 'Send JSON.'}, 415);
  let data; try {data = await readBody(request);} catch {return json({error: 'Send a valid request (up to 8 KB).'}, 400);}
  // A filled honeypot looks like a success, so a bot learns nothing, and writes nothing.
  if (data.contact_time) return json({ok: true}, 201);
  const {fields, row} = validateRequest(data);
  if (fields) return json({error: 'Check the highlighted fields.', fields}, 400);
  try {
   const seconds = Math.floor(discRequestNow() / 1000), hour = Math.floor(seconds / HOUR_SECONDS);
   const ipHash = await hash(`${hour}:${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
   const claim = await env.DB.prepare(`INSERT INTO disc_request_throttle(ip_hash,hour,count) VALUES (?,?,1)
    ON CONFLICT(ip_hash) DO UPDATE SET count=count+1 WHERE count<? RETURNING count`).bind(ipHash, hour, HOURLY_LIMIT).first();
   if (!claim) return json({error: 'That’s the most requests we can take from here for now. Please try again in an hour.', code: 'throttled'}, 429, {'Retry-After': String(HOUR_SECONDS - seconds % HOUR_SECONDS)});
   await env.DB.prepare(`INSERT INTO disc_requests(id,created_at,disc_name,manufacturer,speed,glide,turn,fade,link,note,email) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(crypto.randomUUID(), seconds, row.discName, row.manufacturer, row.speed, row.glide, row.turn, row.fade, row.link, row.note, row.email).run();
   return json({ok: true}, 201);
  } catch {
   // Log only a fixed category, never what the visitor typed.
   console.error('Disc request failed', {reason: 'storage-error'});
   return json({error: 'Your request could not be saved. Please try again.'}, 503);
  }
 }};
}

export async function cleanupDiscRequestThrottle(env, date = Date.now()) {
 await env.DB.prepare('DELETE FROM disc_request_throttle WHERE hour<?').bind(Math.floor(date / 1000 / HOUR_SECONDS)).run();
}
