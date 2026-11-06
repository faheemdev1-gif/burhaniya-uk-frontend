const configured=(import.meta.env.VITE_API_URL||'/api').trim().replace(/\/+$/,'');
export const backendEnabled=true;
let csrf='';export const setCsrf=(value:string)=>{csrf=value;};
export async function apiRequest(path:string,body?:unknown,options:{method?:string}={}){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(configured+path,{method:options.method||(body===undefined?'GET':'POST'),credentials:'include',headers:{'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':csrf}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});const data=await response.json().catch(()=>({message:'The backend did not respond. Start the server and check VITE_API_URL.'}));if(!response.ok)throw Object.assign(Error(data.message||'Request failed.'),{status:response.status});return data;}catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw Error('The server took too long. Please try again.');throw error;}finally{clearTimeout(timer);}
}
export async function uploadImage(file:File):Promise<string>{const body=new FormData();body.append('image',file);const res=await fetch(configured+'/admin/media',{method:'POST',credentials:'include',headers:{'X-CSRF-Token':csrf},body});const data=await res.json();if(!res.ok)throw Error(data.message||'Upload failed.');return data.url;}
