import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
async function readModule(path){const source=await readFile(new URL(path,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));}
const {defaultContent}=await readModule('../src/data.ts');
const {validateContent}=await readModule('../src/lib.ts');
const {mediaUsage,replaceMediaEverywhere}=await readModule('../src/media.ts');
const {readApiResponse}=await readModule('../src/api-response.ts');
const base='https://community.example.test';
const replacement={url:'https://api.example.test/media/new-photo.webp',alt:'An approved community photograph',credit:'Client supplied'};

test('replacement reaches the homepage, slides, pages, collections, logo and alias-backed gallery without rewriting copy',()=>{
 const before=structuredClone(defaultContent),old='/images/old-photo.webp';
 before.media=[{id:'original',url:old,alt:'Old',credit:'Old'},{id:'gallery-alias',url:base+old,alt:'Old alias',credit:'Old'}];
 before.home.heroImage=old;before.home.welcomeImage=base+old;
 before.home.slides[0].image=old;before.settings.logo=old;
 before.pages.community.image=old;before.programmes[0].image=old;before.gatherings[0].image=old;before.stories[0].image=old;
 before.galleries=[{id:'album',slug:'album',title:'Album',description:'Description',mediaIds:['gallery-alias']}];
 before.copy['an-editorial-reference']=old;
 before.home.intro='An edit made while an upload was in progress.';
 const after=replaceMediaEverywhere(before,'original',replacement,base);
 validateContent(after);
 for(const value of [after.home.heroImage,after.home.welcomeImage,after.home.slides[0].image,after.settings.logo,after.pages.community.image,after.programmes[0].image,after.gatherings[0].image,after.stories[0].image])assert.equal(value,replacement.url);
 assert.equal(mediaUsage(after,'original',base).length,9);
 assert.deepEqual(after.media.map(m=>m.id),['original','gallery-alias']);
 assert(after.media.every(m=>m.url===replacement.url&&m.alt===replacement.alt&&m.credit===replacement.credit));
 assert.deepEqual(after.galleries,before.galleries);
 assert.equal(after.copy['an-editorial-reference'],old);
 assert.equal(after.home.intro,before.home.intro);
 assert.equal(after.pages.wellbeing.image,before.pages.wellbeing.image);
 assert.equal(before.home.heroImage,old);
 const next=replaceMediaEverywhere(after,'gallery-alias',{...replacement,url:'https://api.example.test/media/second.webp'},base);
 assert.equal(next.home.heroImage,'https://api.example.test/media/second.webp');
 assert.equal(next.media[0].url,next.media[1].url);
});
test('an unused upload is reported as unused and a removed selection cannot silently become a new image',()=>{
 const before=structuredClone(defaultContent);before.media.push({id:'unused',url:'/images/unused.webp',alt:'Unused',credit:'Client supplied'});
 assert.deepEqual(mediaUsage(before,'unused',base),[]);
 const after=replaceMediaEverywhere(before,'unused',replacement,base);
 assert.equal(after.home.heroImage,before.home.heroImage);
 assert.equal(after.media.at(-1).url,replacement.url);
 assert.throws(()=>replaceMediaEverywhere(before,'removed',replacement,base),/no longer/);
});
test('replacement never confuses identically named files on different servers or distinct query variants',()=>{
 const before=structuredClone(defaultContent);before.media[0].url='https://one.example.test/photo.webp';
 before.home.heroImage='https://two.example.test/photo.webp';
 before.home.welcomeImage='https://one.example.test/photo.webp?variant=2';
 const after=replaceMediaEverywhere(before,before.media[0].id,replacement,base);
 assert.equal(after.home.heroImage,before.home.heroImage);assert.equal(after.home.welcomeImage,before.home.welcomeImage);
});
test('a misconfigured frontend returning HTML cannot masquerade as a successful upload, save or publish',async()=>{
 await assert.rejects(readApiResponse(new Response('<html>Frontend fallback</html>',{status:200}),'Check the backend connection'),/Check the backend connection/);
 await assert.rejects(readApiResponse(new Response('null',{status:200}),'Check the backend connection'),/Check the backend connection/);
 await assert.rejects(readApiResponse(new Response('[]',{status:200}),'Check the backend connection'),/Check the backend connection/);
 await assert.rejects(readApiResponse(new Response('<html>Too large</html>',{status:413}),'Upload failed'),/15 MB/);
 await assert.rejects(readApiResponse(Response.json({message:'Please sign in.'},{status:401}),'Upload failed'),/Please sign in/);
 assert.deepEqual(await readApiResponse(Response.json({url:replacement.url},{status:201}),'Upload failed'),{url:replacement.url});
});
