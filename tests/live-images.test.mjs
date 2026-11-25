import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';
async function readModule(path){const source=await readFile(new URL(path,import.meta.url),'utf8');return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));}
const {resolveMediaUrl}=await readModule('../src/media-url.ts');const {uploadAndApply}=await readModule('../src/media-flow.ts');const {defaultContent}=await readModule('../src/data.ts');
const id='f'.repeat(64)+'.webp';
test('uploaded image links follow the actual API configuration, including legacy localhost addresses',()=>{
 for(const source of ['/api/media/'+id,'/media/'+id,'http://localhost:4000/media/'+id,'https://old.example.test/api/media/'+id])assert.equal(resolveMediaUrl(source,'https://actual-api.example.test/api','https://frontend.example.test'),'https://actual-api.example.test/api/media/'+id);
 assert.equal(resolveMediaUrl('/api/media/'+id,'/api','http://localhost:5173'),'http://localhost:5173/api/media/'+id);
 assert.equal(resolveMediaUrl('/images/gathering.webp','https://actual-api.example.test/api','https://frontend.example.test'),'/images/gathering.webp');
 assert.equal(resolveMediaUrl('https://external.example.test/photo.jpg','/api','https://frontend.example.test'),'https://external.example.test/photo.jpg');
 assert.equal(resolveMediaUrl('blob:https://frontend.example.test/preview','/api','https://frontend.example.test'),'blob:https://frontend.example.test/preview');
});
test('an inaccessible prepared upload never reaches the live commit endpoint',async()=>{
 const operations=[];const file={name:'actual-community.jpg'};
 await assert.rejects(uploadAndApply(file,defaultContent,'tea',{upload:async()=>{operations.push('upload');return {url:'/api/media/'+id,mediaVersion:2};},verify:async()=>{operations.push('verify');throw Error('Cannot display this image');},commit:async()=>{operations.push('commit');}}),/Cannot display/);
 assert.deepEqual(operations,['upload','verify']);
});
test('a verified replacement commits only after verification and retains the draft snapshot',async()=>{
 const operations=[],content=structuredClone(defaultContent);content.home.title='Keep this draft title';
 const result=await uploadAndApply({name:'new-community.jpg'},content,'tea',{upload:async()=>{operations.push('upload');return {url:'/api/media/'+id,mediaVersion:2};},verify:async()=>{operations.push('verify');},commit:async body=>{operations.push('commit');assert.equal(body.operation,'replace');assert.equal(body.replaceId,'tea');assert.equal(body.content.home.title,'Keep this draft title');assert.equal(body.alt,'new-community');return {live:true,placements:11};}});
 assert.deepEqual(operations,['upload','verify','commit']);assert.equal(result.live,true);
});
test('an incompatible backend is rejected before changing a live photo',async()=>{
 let committed=false;
 await assert.rejects(uploadAndApply({name:'photo.jpg'},defaultContent,'tea',{upload:async()=>({url:'http://old/media/file.webp'}),verify:async()=>{},commit:async()=>{committed=true;}}),/Update the backend/);assert.equal(committed,false);
});

const {imageTarget}=await readModule('../src/media-flow.ts');
test('each slide uses its stable ID and the welcome photo has its own target',()=>{
 const content=structuredClone(defaultContent);
 assert.deepEqual(imageTarget(content,['home','heroImage']),{section:'home',key:'heroImage'});
 assert.deepEqual(imageTarget(content,['home','welcomeImage']),{section:'home',key:'welcomeImage'});
 for(let i=0;i<content.home.slides.length;i++)assert.deepEqual(imageTarget(content,['home','slides',i,'image']),{section:'slides',id:content.home.slides[i].id,key:'image'});
 content.home.slides.reverse();assert.equal(imageTarget(content,['home','slides',0,'image']).id,content.home.slides[0].id);
 assert.throws(()=>imageTarget(content,['home','slides',99,'image']),/no longer present/);
});
test('uploading for one slide adds the photo then assigns only that slide using the returned draft',async()=>{
 const calls=[],content=structuredClone(defaultContent),target=imageTarget(content,['home','slides',1,'image']);
 const result=await uploadAndApply({name:'slide-three.jpg'},content,undefined,{
  upload:async()=>({url:'/api/media/'+id,mediaVersion:2}),verify:async()=>{},
  commit:async body=>{calls.push(body);if(body.operation==='upload'){const updated=structuredClone(body.content);updated.media.push({id,url:body.url,alt:body.alt,credit:body.credit});return {content:updated};}assert.equal(body.content.media.at(-1).id,id);return {content:body.content,live:true,placements:1};}
 },target);
 assert.deepEqual(calls.map(c=>c.operation),['upload','assign']);assert.deepEqual(calls[1].target,target);assert.equal(calls[1].url,'/api/media/'+id);assert.equal(result.placements,1);
 assert.equal(calls[0].content.home.heroImage,defaultContent.home.heroImage);assert.equal(calls[0].content.home.welcomeImage,defaultContent.home.welcomeImage);
});
test('failed library save never attempts to assign the uploaded photo to a slide',async()=>{
 const calls=[];
 await assert.rejects(uploadAndApply({name:'slide.jpg'},defaultContent,undefined,{upload:async()=>({url:'/api/media/'+id,mediaVersion:2}),verify:async()=>{},commit:async body=>{calls.push(body.operation);throw Error('Draft revision conflict');}},imageTarget(defaultContent,['home','slides',0,'image'])),/revision conflict/);
 assert.deepEqual(calls,['upload']);
});
