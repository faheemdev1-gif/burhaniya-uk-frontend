import { readApiResponse } from "./api-response";
import { imageAllowed } from "./lib";
const configured=(import.meta.env.VITE_API_URL||'/api').trim().replace(/\/+$/,'');
export const backendEnabled=true;
let csrf='';export const setCsrf=(value:string)=>{csrf=value;};
export async function apiRequest(path:string,body?:unknown,options:{method?:string}={}){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(configured+path,{method:options.method||(body===undefined?'GET':'POST'),credentials:'include',headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});return await readApiResponse(response,'The backend did not return a valid response. Start the server and check VITE_API_URL.');}catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw Error('The server took too long. Please try again.');throw error;}finally{clearTimeout(timer);}
}
export async function uploadImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPG, PNG or WebP image. Convert HEIC photographs to JPG first.');
 if(file.size>5*1024*1024)throw Error('Choose an image up to 5 MB.');
 const body=new FormData();body.append('image',file);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
 try{
  const res=await fetch(configured+'/admin/media',{method:'POST',credentials:'include',headers:{'X-CSRF-Token':csrf},body,signal:controller.signal});
  const data=await readApiResponse(res,'The image upload did not reach the backend. Check the API connection and try again.');
  if(typeof data.url!=='string'||!imageAllowed(data.url))throw Error('The upload did not return a valid image address. Your existing image has been kept.');
  return data.url;
 }catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw Error('The image upload took too long. Please try again.');throw error;}finally{clearTimeout(timer);}
}
