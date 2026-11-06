import type { SiteContent } from './types';

export function createId(source: Pick<Crypto,'getRandomValues'> & Partial<Pick<Crypto,'randomUUID'>> = globalThis.crypto): string {
  if (typeof source.randomUUID === 'function') return source.randomUUID();
  // randomUUID requires HTTPS; getRandomValues also supports a local HTTP preview.
  const bytes=source.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export function imageAllowed(value: string): boolean {
  if (/^\/(?!\/)[a-zA-Z0-9_./% -]+$/.test(value) && !value.includes('..')) return true;
  if (/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value) && value.length < 3_000_000) return true;
  try { const url = new URL(value); return (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) && !url.username && !url.password; } catch { return false; }
}
export function validateContent(value: unknown): asserts value is SiteContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Choose a valid website content file.');
  const d = value as SiteContent;
  const strings = (obj: unknown, fields: string[], max = 20000) => {
    if (!obj || typeof obj !== 'object') throw Error('A required content section is missing.');
    for (const key of fields) if (typeof (obj as Record<string,unknown>)[key] !== 'string' || ((obj as Record<string,string>)[key]).length > (/^(image|heroImage|welcomeImage|logo|url)$/.test(key) ? 3_000_000 : max)) throw Error(`Check the ${key} field.`);
  };
  if (d.schemaVersion !== 1) throw Error('This content file uses an unsupported version.');
  strings(d.settings, ['name','organisation','email','phone','address','charityNumber','footerText','logo']);
  if (!d.settings.name.trim() || !d.settings.organisation.trim() || !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(d.settings.email)) throw Error('Check the website name, organisation and contact email.');
  if (d.settings.logo && !imageAllowed(d.settings.logo)) throw Error('Choose a valid logo image.');
  strings(d.home, ['eyebrow','title','accent','intro','heroImage','welcomeTitle','welcomeBody','welcomeImage']);
  for (const key of ['heroImage','welcomeImage'] as const) if (!imageAllowed(d.home[key])) throw Error('Choose a valid homepage image.');
  if (d.home.slides !== undefined) {
    if (!Array.isArray(d.home.slides) || d.home.slides.length > 5) throw Error('Use up to five additional homepage slides.');
    const slideIds = new Set<string>();
    for (const slide of d.home.slides) {
      strings(slide, ['id','eyebrow','title','accent','intro','image','link','linkLabel']);
      if (!slide.id || slideIds.has(slide.id) || !slide.title.trim() || !slide.linkLabel.trim() || !imageAllowed(slide.image)) throw Error('Check the homepage slide fields.');
      slideIds.add(slide.id);
      if (!/^\/(?!\/)[a-z0-9/?=&%#-]*$/i.test(slide.link) || slide.link.includes('..')) throw Error('Use a website page path for the slide link.');
    }
  }
  if (d.copy !== undefined) { if (!d.copy || typeof d.copy!=='object' || Array.isArray(d.copy) || Object.keys(d.copy).length>2000 || Object.entries(d.copy).some(([k,v])=>k.length>200||typeof v!=='string'||v.length>20000)) throw Error('Check the website wording.'); }
  if(d.pages?.gallery){strings(d.pages.gallery,['eyebrow','title','intro','body','image']);if(!imageAllowed(d.pages.gallery.image))throw Error('Choose a valid gallery image.');}
  if (d.galleries !== undefined) {
    if(!d.pages?.gallery)throw Error('Add the gallery page before importing gallery albums.');
    if(!Array.isArray(d.galleries)||d.galleries.length>200)throw Error('Check gallery albums.');const ids=new Set<string>(),slugs=new Set<string>();
    for(const a of d.galleries){strings(a,['id','slug','title','description']);if(!a.id||ids.has(a.id)||slugs.has(a.slug)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug)||!Array.isArray(a.mediaIds)||a.mediaIds.length>200||a.mediaIds.some(id=>typeof id!=='string'||!d.media.some(m=>m.id===id)))throw Error('Check album URLs and selected images.');ids.add(a.id);slugs.add(a.slug);}
  }
  for (const name of ['community','programmes','gatherings','stories','wellbeing','get-involved','contact']) {
    const page = d.pages?.[name as keyof SiteContent['pages']]; strings(page, ['eyebrow','title','intro','body','image']);
    if (!imageAllowed(page.image)) throw Error('Choose a valid page image.');
  }
  for (const key of ['programmes','gatherings','stories','media'] as const) {
    const items = d[key]; if (!Array.isArray(items) || items.length > 200) throw Error(`Check the ${key} list.`);
    const ids = new Set<string>(), slugs = new Set<string>();
    for (const item of items) {
      strings(item, ['id']); if (!item.id || ids.has(item.id)) throw Error('Content items need unique IDs.'); ids.add(item.id);
      if (key === 'media') { const media = item as SiteContent['media'][number]; strings(media,['url','alt','credit'],3_000_000); if (!imageAllowed(media.url)) throw Error('Choose a valid media image.'); }
      else {
        const entry = item as SiteContent['programmes'][number]; strings(entry,['slug','title','summary','body','image']);
        if (!entry.title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) || slugs.has(entry.slug)) throw Error('Use a title and a unique lowercase URL slug.');
        slugs.add(entry.slug); if (!imageAllowed(entry.image)) throw Error('Choose a valid content image.');
        if (key === 'programmes') strings(item,['icon']);
        if (key === 'stories') strings(item,['category','readTime']);
        if (key === 'gatherings') {
          const gathering = item as SiteContent['gatherings'][number]; strings(gathering,['category','date','time','location']);
          if (typeof gathering.sample !== 'boolean' || (gathering.date && (!/^\d{4}-\d{2}-\d{2}$/.test(gathering.date) || !Number.isFinite(Date.parse(gathering.date))))) throw Error('Check the gathering date and preview setting.');
        }
      }
    }
  }
}
export const telephoneHref = (phone: string) => { const p = phone.replace(/[\s().-]/g,''); return /^\+?\d{6,15}$/.test(p) ? `tel:${p}` : undefined; };
export const emailHref = (email: string, subject = '', body = '') => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
export function donationPence(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.'); const amount = Number(whole) * 100 + Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(amount) && amount >= 100 && amount <= 1_000_000 ? amount : null;
}
export const formatDate = (date: string) => date ? new Intl.DateTimeFormat('en-GB', { day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London' }).format(new Date(date + 'T12:00:00Z')) : 'Date to be announced';

export function draftDatabase() {
  return new Promise<IDBDatabase>((resolve,reject) => {
    const request = indexedDB.open('burhaniya-uk-content-preview',1);
    request.onupgradeneeded = () => request.result.createObjectStore('draft');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error('Local draft storage is unavailable. Use Export to keep a copy.'));
  });
}
export async function readDraft(): Promise<SiteContent | null> {
  const db = await draftDatabase();
  try { return await new Promise((resolve,reject) => { const tx=db.transaction('draft','readonly'); const q=tx.objectStore('draft').get('site');q.onsuccess=()=>resolve(q.result || null);q.onerror=()=>reject(q.error); }); } finally { db.close(); }
}
export async function writeDraft(content: SiteContent): Promise<void> {
  validateContent(content); const db=await draftDatabase();
  try { await new Promise<void>((resolve,reject)=>{const tx=db.transaction('draft','readwrite');tx.objectStore('draft').put(content,'site');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(Error('The draft could not be saved. Export a copy before leaving.'));tx.onabort=()=>reject(Error('The draft could not be saved.'));}); } finally {db.close();}
}
export function exportFile(content: SiteContent) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='burhaniya-uk-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function uploadPreviewImage(file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) throw Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
  const bitmap=await createImageBitmap(file);
  try { const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing is unavailable.');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.86); } finally {bitmap.close();}
}

// Upgrade the old bundled preview without discarding custom copy or uploaded photos.
// This runs only for browser-local drafts; published API content stays authoritative.
export function upgradePreviewContent(value:SiteContent, defaults:SiteContent):SiteContent {
  if(value.home.slides!==undefined)return value;
  const copy=structuredClone(value);
  const images:Record<string,string>={'/images/garden.webp':'/images/relaxing.webp','/images/tea.webp':'/images/gathering.webp','/images/hands.webp':'/images/volunteers.webp'};
  copy.home.slides=structuredClone(defaults.home.slides||[]);
  if(copy.home.title==='A little stillness.')copy.home.title=defaults.home.title;
  if(copy.home.accent==='A deeper connection.')copy.home.accent=defaults.home.accent;
  if(copy.home.eyebrow==='Rooted in tradition. Open in spirit.')copy.home.eyebrow=defaults.home.eyebrow;
  if(copy.home.heroImage==='/images/garden.webp')copy.home.heroImage=defaults.home.heroImage;
  for(const key of ['heroImage','welcomeImage'] as const)copy.home[key]=images[copy.home[key]]||copy.home[key];
  for(const page of Object.values(copy.pages))page.image=images[page.image]||page.image;
  for(const key of ['programmes','gatherings','stories'] as const)for(const item of copy[key])item.image=images[item.image]||item.image;
  for(const media of copy.media){const replacement=images[media.url];if(replacement){media.url=replacement;media.alt=defaults.media.find(m=>m.url===replacement)?.alt||media.alt;}}
  for(const media of defaults.media)if(!copy.media.some(m=>m.url===media.url))copy.media.push(structuredClone(media));
  return copy;
}
