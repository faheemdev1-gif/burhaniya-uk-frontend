import { resolveMediaUrl } from "./media-url";
import { optimiseUpload, verifyImage } from "./image-upload";
import { readApiResponse } from "./api-response";
import { imageAllowed } from "./lib";
const configured=(import.meta.env.VITE_API_URL||'/api').trim().replace(/\/+$/,'');
export const backendEnabled=true;
export const apiAddress=configured;
export const imageUrl=(value:string)=>resolveMediaUrl(value,configured,window.location.origin);
export const checkImage=(value:string)=>verifyImage(imageUrl(value));
let csrf='';export const setCsrf=(value:string)=>{csrf=value;};
export async function apiRequest(path:string,body?:unknown,options:{method?:string}={}){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(configured+path,{method:options.method||(body===undefined?'GET':'POST'),credentials:'include',headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});return await readApiResponse(response,'The backend did not return a valid response. Start the server and check VITE_API_URL.');}catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw Error('The server took too long. Please try again.');throw error;}finally{clearTimeout(timer);}
}
export async function uploadImage(file:File):Promise<{url:string;mediaVersion:number}>{
 const status=await apiRequest('/admin/media/status');
 if(status.mediaVersion!==2)throw Error('Update the backend to 2.1.0 to use live image updates.');
 file=await optimiseUpload(file);
 const body=new FormData();body.append('image',file);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
 try{
  const res=await fetch(configured+'/admin/media',{method:'POST',credentials:'include',headers:{'X-CSRF-Token':csrf},body,signal:controller.signal});
  const data=await readApiResponse(res,'The image upload did not reach the backend. Check the API connection and try again.');
  if(typeof data.url!=='string'||!imageAllowed(data.url))throw Error('The upload did not return a valid image address. Your existing image has been kept.');
  return {url:data.url,mediaVersion:data.mediaVersion};
 }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw Error('The image upload took too long. Please try again.');throw error;}finally{clearTimeout(timer);}
}
