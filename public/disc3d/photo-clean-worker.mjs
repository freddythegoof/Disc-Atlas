// Off the main thread: a stored photo's cleanup plan, and its cleaned image (photo-clean.mjs).
import {planPhoto,cleanPhoto} from './photo-clean.mjs';
self.onmessage=async({data:{id,op,blob,size,plan}})=>{
 try{
  if(op==='plan'){const result=await planPhoto(blob);self.postMessage({id,plan:result});}
  else{const image=await cleanPhoto(blob,size,plan);self.postMessage({id,image},[image]);}
 }catch(error){self.postMessage({id,error:String(error?.message||error)});}
};
