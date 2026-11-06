import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
async function moduleFrom(file) {
  const source=await fs.readFile(new URL(file,import.meta.url),'utf8');
  const outputText=stripTypeScriptTypes(source,{mode:'strip'});
  return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
}
const {validateContent,imageAllowed,donationPence,telephoneHref,emailHref,createId}=await moduleFrom('../src/lib.ts');
const {defaultContent}=await moduleFrom('../src/data.ts');
test('the new project retains the supplied organisation and contact identity',()=>{
  validateContent(defaultContent);
  assert.equal(defaultContent.settings.name,'TARIQA BURHANIYA DISUQIYA SHADHULIYA');
  assert.equal(defaultContent.settings.organisation,'Al Burhaniya UK');
  assert.equal(defaultContent.settings.email,'admin@burhaniya.org.uk');
  assert.equal(defaultContent.settings.phone,'+44 7866 699995');
  assert.equal(defaultContent.settings.address,'258 Harrow Road, London, W2 5ES');
  assert(!JSON.stringify(defaultContent).includes('alburhaniyainternational.org.uk'));
});
test('content imports reject incomplete structures, duplicate URLs and unsafe images',()=>{
  for(const change of [d=>delete d.pages.contact,d=>d.stories[0].slug='../../admin',d=>d.programmes[1].slug=d.programmes[0].slug,d=>d.media[0].url='javascript:alert(1)',d=>d.settings.email='a@example.com\nBcc:b@example.com',d=>d.gatherings[0].sample='false']) {
    const draft=structuredClone(defaultContent);change(draft);assert.throws(()=>validateContent(draft));
  }
  assert.throws(()=>validateContent({schemaVersion:2}));
});
test('optimised uploaded photos survive validation and JSON export/import',()=>{
  const draft=structuredClone(defaultContent),url='data:image/webp;base64,'+'A'.repeat(150000);
  draft.media.push({id:'uploaded',url,alt:'Approved photograph',credit:'Client supplied'});
  draft.home.heroImage=url;draft.pages.community.image=url;draft.programmes[0].image=url;draft.settings.logo=url;
  validateContent(draft);validateContent(JSON.parse(JSON.stringify(draft)));
  assert.equal(defaultContent.home.heroImage,'/images/gathering.webp');
});
test('image selections cannot introduce SVG payloads, protocol-relative or credential-bearing URLs',()=>{
  for(const value of ['javascript:alert(1)','//example.test/image.png','http://example.test/a.jpg','https://user:pass@example.test/a.jpg','data:image/svg+xml;base64,PHN2Zz4=','/../../file']) assert.equal(imageAllowed(value),false,value);
  for(const value of ['/images/garden.webp','https://cdn.example.test/a.webp','data:image/webp;base64,AAAA'])assert.equal(imageAllowed(value),true,value);
});
test('donation selection preserves exact GBP pence and rejects invalid totals',()=>{
  assert.equal(donationPence('73.17'),7317);assert.equal(donationPence('25.1'),2510);assert.equal(donationPence('1'),100);assert.equal(donationPence('10000'),1000000);
  for(const value of ['','0','-10','1.001','1e3','10,00','Infinity','10000.01'])assert.equal(donationPence(value),null,value);
});
test('contact links preserve the phone number and encode user text in an email draft',()=>{
  assert.equal(telephoneHref(defaultContent.settings.phone),'tel:+447866699995');assert.equal(telephoneHref('invalid'),undefined);
  const link=emailHref('admin@burhaniya.org.uk','First visit & questions','Hello\nName: A&B?');assert(link.startsWith('mailto:admin@burhaniya.org.uk?subject=First%20visit%20%26%20questions&body='));assert(link.includes('A%26B%3F'));
});
test('unconfirmed gathering examples never pretend to have booked dates',()=>{
  assert(defaultContent.gatherings.every(g=>g.sample===true&&g.date===''));
  assert(defaultContent.media.every(m=>m.credit.includes('illustrative')));
});
test('IDs remain valid UUIDs in local HTTP previews where randomUUID is unavailable',()=>{
  const id=createId({getRandomValues(array){array.fill(21);return array;}});
  assert.match(id,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.notEqual(createId(),createId());
});

const {heroSlides,nextSlide}=await moduleFrom('../src/carousel.ts');
const {upgradePreviewContent}=await moduleFrom('../src/lib.ts');
test('carousel wraps in both directions and keeps a stable first-visit entry',()=>{
  assert.equal(nextSlide(0,-1,3),2);assert.equal(nextSlide(2,1,3),0);assert.equal(nextSlide(0,1,1),0);assert.equal(nextSlide(0,1,0),0);
  const slides=heroSlides(defaultContent);assert.equal(slides.length,3);assert.equal(slides[0].image,defaultContent.home.heroImage);assert.equal(new Set(slides.map(s=>s.image)).size,3);
});
test('slide imports reject script links, duplicate IDs, unsafe images and too many slides',()=>{
 for(const change of [d=>d.home.slides[0].link='javascript:alert(1)',d=>d.home.slides[0].link='//example.test',d=>d.home.slides[1].id=d.home.slides[0].id,d=>d.home.slides[0].image='data:image/svg+xml;base64,AAAA',d=>d.home.slides=Array(6).fill(d.home.slides[0])]){
  const d=structuredClone(defaultContent);change(d);assert.throws(()=>validateContent(d));
 }
});
test('legacy local drafts gain slides and people images without erasing custom content',()=>{
 const old=structuredClone(defaultContent);delete old.home.slides;old.home.title='My custom welcome';old.home.heroImage='data:image/webp;base64,AAAA';old.pages.community.image='/images/tea.webp';old.settings.email='team@example.test';
 validateContent(old);const upgraded=upgradePreviewContent(old,defaultContent);validateContent(upgraded);
 assert.equal(heroSlides(upgraded).length,3);assert.equal(upgraded.home.title,old.home.title);assert.equal(upgraded.home.heroImage,old.home.heroImage);assert.equal(upgraded.settings.email,old.settings.email);assert.equal(upgraded.pages.community.image,'/images/gathering.webp');assert.equal(old.pages.community.image,'/images/tea.webp');
 assert.deepEqual(upgradePreviewContent(upgraded,defaultContent),upgraded);
});

const {rotationAllowed}=await moduleFrom('../src/carousel.ts');
test('explicit Play restarts rotation and reduced-motion users can choose playback',()=>{
 assert.equal(rotationAllowed('playing',false,false,false,3),true);
 assert.equal(rotationAllowed('paused',false,false,false,3),false);
 assert.equal(rotationAllowed('auto',false,true,false,3),false);
 assert.equal(rotationAllowed('playing',false,true,false,3),true);
 assert.equal(rotationAllowed('playing',true,false,false,3),false);
 assert.equal(rotationAllowed('playing',false,false,true,3),false);
 assert.equal(rotationAllowed('playing',false,false,false,1),false);
});
