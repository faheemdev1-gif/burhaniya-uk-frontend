import {test} from 'node:test';import assert from 'node:assert/strict';
import {createServer} from 'vite';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {MemoryRouter} from 'react-router-dom';
test('all slide image controls render outside collapsed wording panels with separate uploads and welcome image',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 const previousWindow=globalThis.window;globalThis.window={location:{origin:'http://localhost:5173'}};
 try{
  const {default:ContentStudio}=await vite.ssrLoadModule('/src/admin.tsx');
  const {ContentProvider}=await vite.ssrLoadModule('/src/ContentContext.tsx');
  const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/admin/home']},React.createElement(ContentProvider,null,React.createElement(ContentStudio))));
  const photos=html.slice(html.indexOf('aria-label="Homepage slide photographs"'),html.indexOf('<h2>First slide and welcome wording'));
  assert(!photos.includes('<details'));assert.equal((photos.match(/class="studio-slide-photo-card"/g)||[]).length,3);
  for(const n of [1,2,3]){assert(photos.includes('Slide '+n+' image'));assert(photos.includes('aria-label="Upload for Slide '+n+' image"'));}
  assert.equal((photos.match(/Choose from photo library/g)||[]).length,3);assert(html.includes('aria-label="Upload for Welcome image"'));
 }finally{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;await vite.close();}
});
