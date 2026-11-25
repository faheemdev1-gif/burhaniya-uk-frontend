import {useEffect,useRef,useState} from 'react';
import {apiRequest} from './api';import {createId} from './lib';
import {checkoutTotal,confirmDonation,loadStripeLibrary,type BillingDonor} from './stripe-checkout';
export type PaymentController={confirm:(donor:BillingDonor,giftAid:boolean)=>Promise<void>};
export default function StripeDonationPayment({publishableKey,pence,frequency,onReady,onTotal}:{publishableKey:string;pence:number;frequency:string;onReady:(controller:PaymentController|null)=>void;onTotal:(value:string)=>void}){
 const host=useRef<HTMLDivElement>(null),id=useRef(createId()),callbacks=useRef({onReady,onTotal});callbacks.current={onReady,onTotal};
 const [error,setError]=useState(''),[ready,setReady]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true,checkout:any,element:any,actions:any,sessionId='',actionsReady=false,elementReady=false;
  setError('');setReady(false);callbacks.current.onReady(null);
  const timeout=setTimeout(()=>{if(active&&!elementReady){setError('The payment fields could not finish loading. Please try again.');callbacks.current.onReady(null);}},25000);
  function finish(){if(!active||!actionsReady||!elementReady)return;clearTimeout(timeout);setError('');setReady(true);callbacks.current.onReady({async confirm(donor,giftAid){
   const session=actions.getSession();callbacks.current.onTotal(checkoutTotal(session,pence));
   await confirmDonation(actions,body=>apiRequest('/donations/details',body),id.current,donor,giftAid,pence);
   window.location.assign('/donation/return?session_id='+encodeURIComponent(sessionId));
  }});}
  async function start(){
   try{
    const factory=await loadStripeLibrary();if(!active)return;
    const prepared=await apiRequest('/donations/checkout',{amountPence:pence,currency:'gbp',frequency,submissionId:id.current,paymentUI:'custom'});if(!active)return;
    if(typeof prepared.clientSecret!=='string'||!prepared.clientSecret.includes('_secret_')||typeof prepared.sessionId!=='string'||!/^cs_[A-Za-z0-9_]+$/.test(prepared.sessionId))throw Error('The payment session was not prepared correctly.');sessionId=prepared.sessionId;
    const stripe=factory(publishableKey,{locale:'en-GB'});
    // Clover matches the server Stripe SDK/API. Newer Stripe.js trains rename this method.
    if(typeof stripe.initCheckout!=='function')throw Error('The payment library version is incompatible. Please reload this page.');
    checkout=stripe.initCheckout({clientSecret:prepared.clientSecret,elementsOptions:{appearance:{theme:'stripe',variables:{colorPrimary:'#65b769',fontFamily:'Arial, sans-serif',fontSizeBase:'16px',borderRadius:'4px'}}}});
    element=checkout.createPaymentElement({layout:'tabs'});
    element.on('ready',()=>{elementReady=true;finish();});
    element.on('loaderror',()=>{if(active){setError('The secure card fields could not load. Please check your connection and try again.');callbacks.current.onReady(null);}});
    element.mount(host.current);
    const loaded=await checkout.loadActions();if(!active)return;
    if(loaded.type==='error')throw Error(loaded.error?.message||'The payment session could not load.');
    actions=loaded.actions;callbacks.current.onTotal(checkoutTotal(actions.getSession(),pence));actionsReady=true;
    checkout.on('change',()=>{if(active&&actions){try{callbacks.current.onTotal(checkoutTotal(actions.getSession(),pence));}catch(e){setError((e as Error).message);callbacks.current.onReady(null);}}});finish();
   }catch(e){if(active){clearTimeout(timeout);setError((e as Error).message);callbacks.current.onReady(null);}}
  }
  // Debounce amount changes so editing a custom amount does not create a session for every keystroke.
  const timer=setTimeout(()=>void start(),500);
  return()=>{active=false;clearTimeout(timer);clearTimeout(timeout);callbacks.current.onReady(null);element?.destroy();if(typeof checkout?.destroy==='function')checkout.destroy();};
 },[publishableKey,pence,frequency,retry]);
 return <div className="donate-payment-element"><div ref={host}/>{!ready&&!error&&<p role="status">Loading secure payment fields…</p>}{error&&<div role="alert" className="donate-error"><p>{error}</p><button type="button" onClick={()=>{id.current=createId();setRetry(r=>r+1);}}>Retry payment form</button></div>}</div>;
}
