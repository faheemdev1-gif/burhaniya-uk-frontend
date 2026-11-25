export type BillingDonor={firstName:string;lastName:string;email:string;phone:string;address:{country:string;line1:string;line2:string;city:string;region:string;postcode:string}};
export const stripeScriptUrl='https://js.stripe.com/clover/stripe.js';
export function stripeBilling(d:BillingDonor){return {name:(d.firstName+' '+d.lastName).trim(),address:{country:d.address.country,line1:d.address.line1,line2:d.address.line2,city:d.address.city,state:d.address.region,postal_code:d.address.postcode}};}
export function checkoutTotal(session:any,expectedPence:number):string{
 const total=session?.total?.total;
 if(session?.currency!=='gbp'||!total||typeof total.amount!=='string')throw Error('The payment total could not be verified. Please reload the payment form.');
 if(!Number.isSafeInteger(total.minorUnitsAmount)||total.minorUnitsAmount!==expectedPence)throw Error('The payment total changed. Please review your donation.');
 return total.amount;
}
let loading:Promise<any>|undefined;
export function loadStripeLibrary():Promise<any>{
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=stripeScriptUrl;script.async=true;script.dataset.burhaniyaStripe='clover';
  const timer=setTimeout(()=>finish(Error('The secure payment form took too long to load. Check your connection and try again.')),15000);
  function finish(error?:Error){clearTimeout(timer);script.onload=null;script.onerror=null;if(error){script.remove();loading=undefined;reject(error);}else resolve((window as any).Stripe);}
  script.onload=()=>typeof (window as any).Stripe==='function'?finish():finish(Error('The secure payment library did not load.'));
  script.onerror=()=>finish(Error('Stripe could not load. Check your connection or content blocker and try again.'));
  document.head.appendChild(script);
 });return loading;
}

export async function confirmDonation(actions:any,save:(body:unknown)=>Promise<unknown>,submissionId:string,donor:BillingDonor,giftAid:boolean,pence:number){
 const session=actions.getSession();checkoutTotal(session,pence);
 await save({submissionId,donor,giftAid});
 const result=await actions.confirm({email:donor.email.trim(),billingAddress:stripeBilling(donor),redirect:'if_required'});
 if(result?.type==='error'||result?.error)throw Error(result.error?.message||'Your payment could not be completed. Check your details and try again.');
 return session.id as string;
}
