import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';
import {createServer} from 'vite';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {MemoryRouter} from 'react-router-dom';
const source=await readFile(new URL('../src/stripe-checkout.ts',import.meta.url),'utf8');const {checkoutTotal,stripeBilling,confirmDonation,stripeScriptUrl}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const donor={firstName:'Test',lastName:'Donor',email:'donor@example.test',phone:'',address:{country:'GB',line1:'1 Example Road',line2:'',city:'London',region:'',postcode:'W2 5ES'}};
const session={id:'cs_test_offline',currency:'gbp',total:{total:{amount:'£25.00',minorUnitsAmount:2500}}};
test('on-page payment saves donor details before confirming with Stripe and forwards billing fields correctly',async()=>{
 const calls=[],actions={getSession:()=>session,confirm:async body=>{calls.push('confirm');assert.deepEqual(body.billingAddress,stripeBilling(donor));assert.equal(body.email,donor.email);return {type:'success'};}};
 assert.equal(await confirmDonation(actions,async body=>{calls.push('save');assert.equal(body.giftAid,false);assert.equal(body.submissionId,'private-guest-reference');},'private-guest-reference',donor,false,2500),'cs_test_offline');assert.deepEqual(calls,['save','confirm']);assert.equal(stripeScriptUrl,'https://js.stripe.com/clover/stripe.js');
});
test('saving failure and a mismatched payment total both prevent payment confirmation',async()=>{
 let confirmed=false;const actions={getSession:()=>session,confirm:async()=>{confirmed=true;}};
 await assert.rejects(confirmDonation(actions,async()=>{throw Error('Save failed');},'reference',donor,false,2500),/Save failed/);assert(!confirmed);
 await assert.rejects(confirmDonation(actions,async()=>{},'reference',donor,false,5000),/total changed/);assert(!confirmed);
 assert.throws(()=>checkoutTotal({...session,currency:'usd'},2500),/verified/);
});
test('Stripe card errors are surfaced and never converted to a successful payment',async()=>{
 await assert.rejects(confirmDonation({getSession:()=>session,confirm:async()=>({type:'error',error:{message:'Your card was declined.'}})},async()=>{},'reference',donor,false,2500),/card was declined/);
});
test('donation page renders the reference form structure, six amounts, donor address fields and secure payment mount',async()=>{
 const vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});const before=globalThis.window;globalThis.window={location:{origin:'http://localhost:5173'}};
 try{
  const {DonatePage}=await vite.ssrLoadModule('/src/pages.tsx');const {ContentProvider}=await vite.ssrLoadModule('/src/ContentContext.tsx');
  const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/donate']},React.createElement(ContentProvider,null,React.createElement(DonatePage))));
  for(const text of ['Support Our Cause','Donation summary','Billing address','Payment details','Declaration','Donate now','£500.00'])assert(html.includes(text),text);
  for(const name of ['firstName','lastName','email','country','line1','city','postcode'])assert(html.includes('name="'+name+'"'),name);
  assert.equal((html.match(/aria-pressed="false"|aria-pressed="true"/g)||[]).length,6);assert(!html.includes('name="cardNumber"'));assert(!html.includes('name="cvc"'));assert(html.includes('donate-cover'));
 }finally{if(before===undefined)delete globalThis.window;else globalThis.window=before;await vite.close();}
});
