// A local Disc Atlas for trying Hyzer the Disc in the real coach: serves web/index.html and public/, with a mocked
// signed-in account, coach and bag. Questions get an answer naming two discs after COACH_DELAY ms; a question
// containing "fail" gets a 503; Add to bag saves into an in-memory bag. So every mood can be reached by hand.
// Not shipped. Usage: node spikes/hyzer-mascot/serve.mjs [port]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const port = Number(process.argv[2] || process.env.PORT || 8872), delay = Number(process.env.COACH_DELAY || 2500);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.webp': 'image/webp', '.woff2': 'font/woff2', '.wasm': 'application/wasm'};
const json = (res, status, data) => {res.writeHead(status, {'Content-Type': 'application/json'}); res.end(JSON.stringify(data));};
let remaining = 20, seq = 1;
const bag = {bag_model: 'Custom bag', capacity: 20, main_capacity: 16, sort_mode: 'manual', rack_style: 'steel'}, items = [];
const discs = [{id: '3d60892b6812', brand: 'Innova', name: 'Destroyer', flightSource: 'https://www.innovadiscs.com/disc/destroyer/'}, {id: 'e70f48273d7f', brand: 'Innova', name: 'Wraith', flightSource: 'https://www.marshallstreetdiscgolf.com/?s=wraith&post_type=product'}];
const answer = 'Try a stable fairway driver for that wooded hole: a controlled flat release keeps it on line, and the fade at the end is predictable. Field test: throw five at 80% power and note where each one finishes.';

http.createServer(async (req, res) => {
 const url = new URL(req.url, 'http://localhost');
 if (url.pathname === '/api/account') return json(res, 200, {user: {name: 'Freddy Test', email: 'test@example.test'}, csrfToken: 'test', coachReady: true, authReady: true});
 if (url.pathname === '/api/coach' && req.method === 'GET') return json(res, 200, {remaining});
 if (url.pathname === '/api/coach' && req.method === 'POST') {
  let body = ''; for await (const chunk of req) body += chunk;
  const question = JSON.parse(body).messages.at(-1).content;
  await new Promise(r => setTimeout(r, delay));
  if (/fail/i.test(question)) return json(res, 503, {error: 'The AI coach is temporarily unavailable. Please try again later.'});
  return json(res, 200, {answer, discs, provider: 'workers-ai', remaining: --remaining});
 }
 if (url.pathname === '/api/bag' && req.method === 'GET') return json(res, 200, {bag, discs: items});
 if (url.pathname === '/api/bag/discs' && req.method === 'POST') {
  let body = ''; for await (const chunk of req) body += chunk;
  const disc = {...JSON.parse(body), id: 'd' + seq++, status: 'active', position: items.length}; items.push(disc);
  return json(res, 200, {disc});
 }
 if (url.pathname.startsWith('/api/')) return json(res, 503, {error: 'Not mocked'});
 const file = url.pathname === '/' ? 'web/index.html' : ['/bag-plastics.json', '/bag-models.json'].includes(url.pathname) ? 'source-data' + url.pathname : 'public' + url.pathname;
 if (file.includes('..')) {res.writeHead(400); res.end(); return;}
 try {const data = fs.readFileSync(file); res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'}); res.end(data);}
 catch {res.writeHead(404); res.end();}
}).listen(port, '127.0.0.1', () => console.log(`Disc Atlas with a mocked coach on http://127.0.0.1:${port}`));
