export interface HeroSlide { id: string; eyebrow: string; title: string; accent: string; intro: string; image: string; link: string; linkLabel: string }
export interface Media { id: string; url: string; alt: string; credit: string }
export interface PageCopy { eyebrow: string; title: string; intro: string; body: string; image: string }
export interface Programme { id: string; slug: string; title: string; summary: string; body: string; image: string; icon: string }
export interface Gathering { id: string; slug: string; title: string; category: string; date: string; time: string; location: string; summary: string; body: string; image: string; sample: boolean }
export interface Story { id: string; slug: string; title: string; category: string; summary: string; body: string; image: string; readTime: string }
export interface GalleryAlbum { id:string; slug:string; title:string; description:string; mediaIds:string[] }
export interface SiteContent {
  galleries?: GalleryAlbum[];
  copy?: Record<string,string>;
  schemaVersion: 1;
  settings: { name: string; organisation: string; email: string; phone: string; address: string; charityNumber: string; footerText: string; logo: string };
  home: { eyebrow: string; title: string; accent: string; intro: string; heroImage: string; welcomeTitle: string; welcomeBody: string; welcomeImage: string; slides?: HeroSlide[] };
  pages: Record<'community'|'programmes'|'gatherings'|'stories'|'wellbeing'|'get-involved'|'contact'|'gallery', PageCopy>;
  programmes: Programme[];
  gatherings: Gathering[];
  stories: Story[];
  media: Media[];
}
