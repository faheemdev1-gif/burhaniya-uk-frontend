import type { Media, SiteContent } from './types';

type ImageSlot = { path: (string | number)[]; label: string; url: string };
function imageSlots(content: SiteContent): ImageSlot[] {
  return [
    {path:['settings','logo'],label:'Logo',url:content.settings.logo},
    {path:['home','heroImage'],label:'Homepage hero',url:content.home.heroImage},
    {path:['home','welcomeImage'],label:'Homepage welcome',url:content.home.welcomeImage},
    ...(content.home.slides || []).map((slide,i)=>({path:['home','slides',i,'image'],label:`Homepage slide ${i+2}`,url:slide.image})),
    ...Object.entries(content.pages).map(([name,page])=>({path:['pages',name,'image'],label:`Page: ${name}`,url:page.image})),
    ...(['programmes','gatherings','stories'] as const).flatMap(section=>content[section].map((item,i)=>({path:[section,i,'image'],label:`${section === 'stories' ? 'Article' : section === 'gatherings' ? 'Gathering' : 'Programme'}: ${item.title}`,url:item.image}))),
  ];
}
function sameImage(a: string, b: string, base: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  try { const first=new URL(a,base),second=new URL(b,base);first.hash='';second.hash='';return first.href===second.href; } catch { return false; }
}
export function mediaUsage(content: SiteContent, id: string, base: string): string[] {
  const selected=content.media.find(item=>item.id===id);
  if (!selected) return [];
  const aliases=new Set(content.media.filter(item=>sameImage(item.url,selected.url,base)).map(item=>item.id));
  return [
    ...imageSlots(content).filter(slot=>sameImage(slot.url,selected.url,base)).map(slot=>slot.label),
    ...(content.galleries || []).filter(album=>album.mediaIds.some(id=>aliases.has(id))).map(album=>`Gallery: ${album.title}`),
  ];
}
export function replaceMediaEverywhere(current: SiteContent, id: string, replacement: Pick<Media,'url'|'alt'|'credit'>, base: string): SiteContent {
  const selected=current.media.find(item=>item.id===id);
  if (!selected) throw Error('That image is no longer in your draft. Reload Images and try again.');
  const result=structuredClone(current);
  for (const slot of imageSlots(result)) {
    if (!sameImage(slot.url,selected.url,base)) continue;
    let target: any=result;
    for (const key of slot.path.slice(0,-1)) target=target[key];
    target[slot.path.at(-1)!]=replacement.url;
  }
  // Preserve alias IDs: gallery albums refer to those IDs, not image URLs.
  result.media=result.media.map(item=>sameImage(item.url,selected.url,base)?{...item,...replacement}:item);
  return result;
}
