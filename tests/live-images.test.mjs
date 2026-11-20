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
