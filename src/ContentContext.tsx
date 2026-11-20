import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {useLocation} from 'react-router-dom';
import {defaultContent} from './data';import {validateContent} from './lib';import {apiRequest} from './api';import type {SiteContent} from './types';
const Context=createContext<{content:SiteContent;ready:boolean;notice:string;save:(value:SiteContent)=>Promise<void>;loadAdmin:()=>Promise<void>;publish:()=>Promise<void>;reloadPublic:()=>Promise<void>;commitImage:(body:any)=>Promise<any>}>({content:defaultContent,ready:false,notice:'',save:async()=>{},loadAdmin:async()=>{},publish:async()=>{},reloadPublic:async()=>{},commitImage:async()=>{}});
export function ContentProvider({children}:{children:ReactNode}){
 const location=useLocation(),adminPath=location.pathname.startsWith('/admin');
 const [content,setContent]=useState(defaultContent),[ready,setReady]=useState(false),[notice,setNotice]=useState('');
 const revision=useRef(0),publicRevision=useRef(0),mode=useRef(adminPath),generation=useRef(0),publicCache=useRef(defaultContent);
 mode.current=adminPath;
 const refreshPublic=useCallback(async()=>{const stamp=++generation.current;const data=await apiRequest('/site-content');validateContent(data);if(stamp!==generation.current)return;publicCache.current=data;if(!mode.current)setContent(data);setNotice('');},[]);
 const reloadPublic=useCallback(async()=>{await refreshPublic();if(!mode.current)setContent(publicCache.current);},[refreshPublic]);
 useEffect(()=>{let active=true;refreshPublic().catch(()=>{if(active)setNotice('The live service could not be reached. Showing the design preview; online forms require the backend.');}).finally(()=>{if(active)setReady(true);});return()=>{active=false;generation.current++;};},[refreshPublic]);
 useEffect(()=>{generation.current++;if(!adminPath){setContent(publicCache.current);void refreshPublic().catch(()=>{});}},[adminPath,refreshPublic]);
 useEffect(()=>{
  let checking=false,cancelled=false,retryAfter=0;
  async function check(force=false){if(cancelled||mode.current||document.visibilityState==='hidden'||checking||(!force&&Date.now()<retryAfter))return;checking=true;try{const row=await apiRequest('/site-revision');if(force||row.revision!==publicRevision.current){await refreshPublic();publicRevision.current=row.revision;}retryAfter=0;}catch{retryAfter=Date.now()+10000;}finally{checking=false;}}
  const timer=setInterval(()=>void check(),3000),focus=()=>void check(true);
  let channel:BroadcastChannel|undefined;try{channel=new BroadcastChannel('burhaniya-site-updates');channel.onmessage=focus;}catch{}
  window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
  return()=>{cancelled=true;clearInterval(timer);channel?.close();window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);};
 },[refreshPublic]);
 function notify(){try{const channel=new BroadcastChannel('burhaniya-site-updates');channel.postMessage({updated:true});channel.close();}catch{}}
 async function loadAdmin(){generation.current++;const data=await apiRequest('/admin/content');validateContent(data.content);revision.current=data.revision;setContent(data.content);setNotice('Staff draft preview. Text edits require publishing; image changes are applied automatically.');}
 async function save(value:SiteContent){validateContent(value);const data=await apiRequest('/admin/content',{content:value,revision:revision.current},{method:'PUT'});revision.current=data.revision;setContent(data.content);}
 async function publish(){await apiRequest('/admin/content/publish',{revision:revision.current});notify();}
 async function commitImage(body:any){const data=await apiRequest('/admin/media/commit',{...body,revision:revision.current});validateContent(data.content);revision.current=data.revision;setContent(data.content);notify();return data;}
 return <Context.Provider value={{content,ready,notice,save,loadAdmin,publish,reloadPublic,commitImage}}>{children}</Context.Provider>;
}
export const useContent=()=>useContext(Context);
