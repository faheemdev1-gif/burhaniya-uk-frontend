import type { SiteContent } from './types';
type Services={upload:(file:File)=>Promise<{url:string;mediaVersion:number}>;verify:(url:string)=>Promise<void>;commit:(body:any)=>Promise<any>;phase?:(message:string)=>void};
export async function uploadAndApply(file:File,content:SiteContent,replaceId:string|undefined,services:Services,target?:ImageTarget){
  services.phase?.('Uploading and optimising your photograph…');
  const asset=await services.upload(file);
  if(asset.mediaVersion!==2)throw Error('Update the backend to version 2.1.0 before uploading images. Your current image has been kept.');
  services.phase?.('Checking that the uploaded photograph can be displayed…');
  await services.verify(asset.url);
  services.phase?.(replaceId?'Updating the live image placements…':'Saving the image to your library…');
  const saved=await services.commit({operation:replaceId?'replace':'upload',replaceId,url:asset.url,alt:file.name.replace(/\.[^.]+$/,'')||'Community photograph',credit:'Uploaded by the site editor.',content});
  if(!target)return saved;
  services.phase?.('Applying the photograph to this placement only…');
  return services.commit({operation:'assign',target,url:asset.url,content:saved.content});
}

export type ImageTarget={section:string;id?:string;key:string};
export function imageTarget(content:SiteContent,path:(string|number)[]):ImageTarget{
 if(path[0]==='home'&&path[1]==='slides'){
  const slide=content.home.slides?.[Number(path[2])];
  if(!slide)throw Error('This slide is no longer present. Reload the latest draft.');
  return {section:'slides',id:slide.id,key:'image'};
 }
 if(path[0]==='home'||path[0]==='settings'||path[0]==='donation')return {section:path[0],key:String(path[1])};
 if(path[0]==='pages')return {section:'pages',id:String(path[1]),key:'image'};
 const row=(content[path[0] as 'programmes'|'gatherings'|'stories'] as {id:string}[])?.[Number(path[1])];
 if(!row)throw Error('This entry is no longer present. Reload the latest draft.');
 return {section:String(path[0]),id:row.id,key:'image'};
}
