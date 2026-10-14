import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

// Exercise the production handler with controlled async boundaries. The DOM and
// network are doubles; neither save/retry logic nor thumbnail scheduling is copied.
const bagSource=readFileSync(new URL('../public/my-bag.js',import.meta.url),'utf8');
function sourceBetween(start,end){
 const first=bagSource.indexOf(start),last=bagSource.indexOf(end,first);
 assert.ok(first>=0&&last>first,`Production source boundary missing: ${start}`);
 return bagSource.slice(first,last);
}
const saveSource=sourceBetween("$('#addDiscForm').addEventListener('submit'",'function updateRimColor()');
const apiSource=sourceBetween('async function api(','async function loadBag()');
const closeSource=sourceBetween("$('#addDiscDialog').addEventListener('close'",'\n');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const photoResponse=()=>({ok:true,json:async()=>({texture_key:'saved-photo.webp'})});

function editorFixture({photoValue=async()=> 'processed-photo',upload=async()=>photoResponse()}={}){
 const nodes=new Map(),calls=[],counts={refreshes:0,renders:0,closes:0};
 const node=selector=>{
  if(!nodes.has(selector)){
   const listeners=new Map();
   nodes.set(selector,{
    value:'bag',hidden:true,textContent:'',disabled:false,
    addEventListener(type,fn){listeners.set(type,fn);},
    emit(type,event={}){return listeners.get(type)?.(event);},
    close(){counts.closes++;this.emit('close');},
   });
  }
  return nodes.get(selector);
 };
 const context={
  DOMException,generation:0,discEditSequence:0,
  account:{user:{id:'owner-a'},csrfToken:'owner-a-token'},
  editing:null,items:[],loading:false,active:false,plastics:{},rimCustomized:false,
  photoEditor:{changed:true,value:photoValue,reset(){}},
  colorHint:()=>({textContent:''}),colorBeforePhoto:null,photoColor:null,
  mold:()=>({}),validateDiscDetails:()=>({mold_id:'mold',notes:'Owner A notes'}),
  render(){counts.renders++;},status(){},loadBag(){counts.refreshes++;},name:()=> 'Disc',
  async fetch(url,options){
   calls.push({url,...options});
   if(url.endsWith('/photo'))return upload();
   return {ok:true,json:async()=>({disc:{id:'saved-disc',mold_id:'mold'}})};
  },
  $:node,
 };
 vm.createContext(context);
 vm.runInContext(apiSource+'\n'+closeSource+'\n'+saveSource,context);
 return {
  context,calls,counts,node,
  submit:()=>node('#addDiscForm').emit('submit',{preventDefault(){}}),
  close:()=>node('#addDiscDialog').close(),
 };
}

test('account switch during photo compression prevents all save requests',async()=>{
 const compression=deferred(),f=editorFixture({photoValue:()=>compression.promise});
 const saving=f.submit();
 f.context.generation++;
 f.context.account={user:{id:'owner-b'},csrfToken:'owner-b-token'};
 compression.resolve('owner-a-photo');
 await saving;
 assert.equal(f.calls.length,0);
 assert.equal(f.context.items.length,0);
 assert.equal(f.counts.refreshes,0);
});

test('network failure preserves the saved copy and successful retry updates exactly one item',async()=>{
 let attempts=0;
 const f=editorFixture({upload:async()=>{
  if(++attempts===1)throw Error('Connection lost');
  return photoResponse();
 }});
 await f.submit();
 assert.equal(f.context.items.length,1);
 assert.equal(f.context.items[0].id,'saved-disc');
 assert.equal(f.context.editing.id,'saved-disc');
 assert.equal(f.node('#addDiscStatus').textContent,'Disc saved. Its photo could not save; try again.');
 assert.equal(f.counts.closes,0);
 await f.submit();
 assert.equal(f.context.items.length,1);
 assert.equal(f.context.items[0].texture_key,'saved-photo.webp');
 assert.deepEqual(f.calls.map(({method,url})=>`${method} ${url}`),[
  'POST /api/bag/discs','PUT /api/bag/discs/saved-disc/photo',
  'PUT /api/bag/discs/saved-disc','PUT /api/bag/discs/saved-disc/photo',
 ]);
 assert.equal(f.counts.closes,1);
});

test('closing the editor during photo compression prevents all save requests',async()=>{
 const compression=deferred(),f=editorFixture({photoValue:()=>compression.promise});
 const saving=f.submit();
 f.close();
 compression.resolve('stale-photo');
 await saving;
 assert.equal(f.calls.length,0);
 assert.equal(f.context.items.length,0);
});

test('an edge error page instead of JSON reports the saved disc and retry still updates it',async()=>{
 let attempts=0;
 const f=editorFixture({upload:async()=>++attempts===1?{ok:false,status:502,json:async()=>{throw new SyntaxError('Unexpected token <');}}:photoResponse()});
 await f.submit();
 assert.equal(f.node('#addDiscStatus').textContent,'Disc saved. Its photo could not save; try again.');
 assert.equal(f.counts.refreshes,1,'reconciles with the server copy');
 await f.submit();
 assert.equal(f.context.items.length,1);
 assert.equal(f.context.items[0].texture_key,'saved-photo.webp');
});

for(const reopen of [false,true])test(`${reopen?'reopening':'closing'} the editor during photo upload reconciles without changing the newer editor`,async()=>{
 const started=deferred(),response=deferred();
 const f=editorFixture({upload:()=>{started.resolve();return response.promise;}});
 const saving=f.submit();
 await started.promise;
 assert.equal(f.context.items.length,1,'Metadata must be visible before upload finishes');
 f.close();
 const nextDisc={id:'other-disc',mold_id:'other-mold'};
 if(reopen){
  // The next opening owns a new sequence and its own current physical copy.
  f.context.discEditSequence++;
  f.context.editing=nextDisc;
  f.node('#addDiscStatus').textContent='New editor status';
  f.node('#saveDisc').disabled=true;
 }
 response.resolve(photoResponse());
 await saving;
 assert.equal(f.counts.refreshes,1);
 assert.equal(f.counts.closes,1,'Old completion must not close the newer editor');
 if(reopen){
  assert.equal(f.context.editing,nextDisc);
  assert.equal(f.node('#addDiscStatus').textContent,'New editor status');
  assert.equal(f.node('#saveDisc').disabled,true);
 }
});

test('account switch during photo upload does not reconcile into the new account',async()=>{
 const started=deferred(),response=deferred();
 const f=editorFixture({upload:()=>{started.resolve();return response.promise;}});
 const saving=f.submit();
 await started.promise;
 f.context.generation++;
 f.context.account={user:{id:'owner-b'},csrfToken:'owner-b-token'};
 f.context.items=[];
 response.resolve(photoResponse());
 await saving;
 assert.equal(f.context.items.length,0);
 assert.equal(f.counts.refreshes,0);
 assert.equal(f.counts.closes,0);
});

test('photo readiness redraws only intersecting thumbnails with the matching URL',async()=>{
 const source=readFileSync(new URL('../public/disc3d/thumbnails.mjs',import.meta.url),'utf8')
  .replace(/^import[^\n]*\n/,'').replace('export function','function');
 let observer,onPhoto,nextFrame=0;
 const frames=new Map(),rendered=[];
 const host=(id,url)=>({
  id,dataset:{discThumbnail:id,photoUrl:url,plateColor:'red'},isConnected:true,classList:{add(){}},replaceChildren(){},
  checkVisibility:()=>true,getBoundingClientRect:()=>({width:64}),
 });
 const visible=host('visible-a','photo-a'),offscreen=host('offscreen-a','photo-a'),other=host('visible-b','photo-b');
 const context={
  performance:{now:()=>0},
  document:{createElement:()=>({style:{},setAttribute(){},getContext:()=>({drawImage(){}})})},
  // Every photo here is still loading, so each render returns its placeholder.
  getAtlasArt:async()=>({render:disc=>{rendered.push(disc.id);return {canvas:{},px:64,fill:.9,pending:true};}}),
  window:{addEventListener:(_type,fn)=>onPhoto=fn,removeEventListener(){}},
  requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},
  cancelAnimationFrame:id=>frames.delete(id),
  IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}unobserve(){}disconnect(){}},
 };
 vm.createContext(context);vm.runInContext(source,context);
 context.observeThumbnails({querySelectorAll:()=>[visible,offscreen,other]},id=>({id}));
 const flush=async()=>{
  await Promise.resolve();await Promise.resolve();
  while(frames.size){const [id,fn]=frames.entries().next().value;frames.delete(id);fn();}
 };
 observer([{target:visible,isIntersecting:true},{target:offscreen,isIntersecting:false},{target:other,isIntersecting:true}]);
 await flush();
 rendered.length=0;
 onPhoto({detail:{url:'photo-a'}});
 await flush();
 assert.deepEqual(rendered,['visible-a']);
 rendered.length=0;
 observer([{target:visible,isIntersecting:false}]);
 onPhoto({detail:{url:'photo-a'}});
 await flush();
 assert.deepEqual(rendered,[]);
});

test('finished thumbnails stop being observed; only a loading photo stays watched',async()=>{
 const source=readFileSync(new URL('../public/disc3d/thumbnails.mjs',import.meta.url),'utf8')
  .replace(/^import[^\n]*\n/,'').replace('export function','function');
 let observer,onPhoto,nextFrame=0;const frames=new Map(),unobserved=[],rendered=[];
 const canvas=()=>({width:0,height:0,style:{},setAttribute(){},getContext:()=>({drawImage(){}})});
 const host=(id,url)=>({id,dataset:{discThumbnail:id,photoUrl:url,plateColor:'red'},isConnected:true,classList:{add(){}},replaceChildren(){},
  checkVisibility:()=>true,getBoundingClientRect:()=>({width:64})});
 const plain=host('plain',''),loading=host('loading','photo-a');let ready=false;
 const context={
  performance:{now:()=>0},document:{createElement:canvas},
  getAtlasArt:async()=>({render:disc=>{rendered.push(disc.id);return {canvas:canvas(),px:64,fill:.9,pending:!!disc.photoURL&&!ready};}}),
  window:{addEventListener:(_type,fn)=>onPhoto=fn,removeEventListener(){}},
  requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),
  IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}unobserve(el){unobserved.push(el.id);}disconnect(){}},
 };
 vm.createContext(context);vm.runInContext(source,context);
 context.observeThumbnails({querySelectorAll:()=>[plain,loading]},id=>({id}));
 const flush=async()=>{await Promise.resolve();await Promise.resolve();while(frames.size){const [id,fn]=frames.entries().next().value;frames.delete(id);fn();}};
 observer([{target:plain,isIntersecting:true},{target:loading,isIntersecting:true}]);await flush();
 assert.deepEqual(unobserved,['plain'],'a finished plain disc is no longer observed');
 ready=true;rendered.length=0;onPhoto({detail:{url:'photo-a'}});await flush();
 assert.deepEqual(rendered,['loading']);assert.deepEqual(unobserved,['plain','loading'],'the photo row is released once finished');
 rendered.length=0;onPhoto({detail:{url:'photo-a'}});await flush();assert.deepEqual(rendered,[],'released rows do no further work');
});
