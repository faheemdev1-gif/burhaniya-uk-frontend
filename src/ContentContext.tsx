import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {defaultContent} from './data';import {validateContent} from './lib';import {apiRequest} from './api';import type {SiteContent} from './types';
const Context=createContext<{content:SiteContent;ready:boolean;notice:string;save:(value:SiteContent)=>Promise<void>;loadAdmin:()=>Promise<void>;publish:()=>Promise<void>;reloadPublic:()=>Promise<void>}>({content:defaultContent,ready:false,notice:'',save:async()=>{},loadAdmin:async()=>{},publish:async()=>{},reloadPublic:async()=>{}});
export function ContentProvider({children}:{children:ReactNode}){const [content,setContent]=useState(defaultContent),[ready,setReady]=useState(false),[notice,setNotice]=useState('');const revision=useRef(0);
 async function reloadPublic(){const data=await apiRequest('/site-content');validateContent(data);setContent(data);setNotice('');}
 useEffect(()=>{reloadPublic().catch(()=>setNotice('The live service could not be reached. Showing the design preview; online forms require the backend.')).finally(()=>setReady(true));},[]);
 async function loadAdmin(){const data=await apiRequest('/admin/content');validateContent(data.content);revision.current=data.revision;setContent(data.content);setNotice('Staff draft preview. Publish from the admin panel to update the public website.');}
 async function save(value:SiteContent){validateContent(value);const data=await apiRequest('/admin/content',{content:value,revision:revision.current},{method:'PUT'});revision.current=data.revision;setContent(data.content);}
 async function publish(){await apiRequest('/admin/content/publish',{revision:revision.current});}
 return <Context.Provider value={{content,ready,notice,save,loadAdmin,publish,reloadPublic}}>{children}</Context.Provider>;}
export const useContent=()=>useContext(Context);
