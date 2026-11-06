import type { HeroSlide, SiteContent } from './types';
export function nextSlide(index:number, direction:number, count:number):number {
  return count>0?((index+direction)%count+count)%count:0;
}
export function heroSlides(content:SiteContent):HeroSlide[] {
  const h=content.home;
  return [{id:'welcome',eyebrow:h.eyebrow,title:h.title,accent:h.accent,intro:h.intro,image:h.heroImage,link:'/community',linkLabel:'Meet our community'},...(h.slides||[])];
}

export function rotationAllowed(mode:'auto'|'playing'|'paused', hidden:boolean, reducedMotion:boolean, actionHovered:boolean, count:number):boolean {
  return count>1 && !hidden && !actionHovered && mode!=='paused' && (!reducedMotion || mode==='playing');
}
