import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {extname} from 'node:path';
import {createRequire} from 'node:module';

export const playwright=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
export async function photoHarness(ref){
 const historical=ref&&execFileSync('git',['show',ref+':public/disc-photo.mjs']);
 const types={'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.html':'text/html'};
 const server=createServer((req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  try{
   if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/disc3d.css"><link rel="stylesheet" href="/my-bag.css"><style>*{box-sizing:border-box}body{margin:0}dialog{border:0}.photo-aligner{background:white}.photo-aligner-frame{background:#ddd}</style><div id="editor"></div>');return;}
   const url=path.startsWith('/fixtures/')?new URL('.'+path,import.meta.url):new URL('../public'+path,import.meta.url);
   res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');
   res.end(path==='/disc-photo.mjs'&&historical?historical:readFileSync(url));
  }catch{res.statusCode=404;res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 return {base:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(r=>server.close(r))};
}
