import type { SiteContent } from './types';
type Services={upload:(file:File)=>Promise<{url:string;mediaVersion:number}>;verify:(url:string)=>Promise<void>;commit:(body:any)=>Promise<any>;phase?:(message:string)=>void};
export async function uploadAndApply(file:File,content:SiteContent,replaceId:string|undefined,services:Services){
  services.phase?.('Uploading and optimising your photograph…');
  const asset=await services.upload(file);
  if(asset.mediaVersion!==2)throw Error('Update the backend to version 2.1.0 before uploading images. Your current image has been kept.');
  services.phase?.('Checking that the uploaded photograph can be displayed…');
  await services.verify(asset.url);
  services.phase?.(replaceId?'Updating the live image placements…':'Saving the image to your library…');
  return services.commit({operation:replaceId?'replace':'upload',replaceId,url:asset.url,alt:file.name.replace(/\.[^.]+$/,'')||'Community photograph',credit:'Uploaded by the site editor.',content});
}
