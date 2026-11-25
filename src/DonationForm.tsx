import StripeDonationPayment,{type PaymentController} from './StripeDonationPayment';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {CreditCard,LockKeyhole,ShieldCheck} from 'lucide-react';
import {useContent} from './ContentContext';import {useSiteCopy} from './SiteCopy';
import {apiRequest} from './api';import {createId,donationPence} from './lib';import {Photo} from './components';
import {donationCopy} from './donation-copy';import './donation.css';
const countryCodes='AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');
const countryNames=new Intl.DisplayNames(['en-GB'],{type:'region'});
const countries=countryCodes.map(code=>({code,name:countryNames.of(code)||code})).sort((a,b)=>a.code==='GB'?-1:b.code==='GB'?1:a.name.localeCompare(b.name));
const money=(pence:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(pence/100);
export default function DonationForm(){
 const {content}=useContent(),siteText=useSiteCopy(),[search]=useSearchParams();
 const t=(key:string)=>siteText('donation.'+key,donationCopy['donation.'+key]);
 const [amount,setAmount]=useState('10'),[custom,setCustom]=useState(''),[frequency,setFrequency]=useState('once'),[giftAid,setGiftAid]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[capabilities,setCapabilities]=useState<{payments:boolean;monthly:boolean;giftAid:boolean;donationVersion:number;stripePublishableKey:string}|null>(null),[unavailable,setUnavailable]=useState(false);
 const [donor,setDonor]=useState({firstName:'',lastName:'',email:'',phone:'',address:{country:'GB',line1:'',line2:'',city:'',region:'',postcode:''}});
 const [controller,setController]=useState<PaymentController|null>(null),[stripeTotal,setStripeTotal]=useState('');
 const pending=useRef(false);const pence=donationPence(amount);
 useEffect(()=>{let active=true;apiRequest('/capabilities').then(data=>{if(active)setCapabilities(data);}).catch(()=>{if(active)setUnavailable(true);});return()=>{active=false;};},[]);
 const available=capabilities?.payments===true&&capabilities.donationVersion===2;
 function changed(){setError('');}
 function amountChanged(){setController(null);setStripeTotal('');changed();}
 function update(key:'firstName'|'lastName'|'email'|'phone',value:string){setDonor(d=>({...d,[key]:value}));changed();}
 function address(key:keyof typeof donor.address,value:string){setDonor(d=>({...d,address:{...d.address,[key]:value}}));if(key==='country'&&value!=='GB')setGiftAid(false);changed();}
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(pending.current||!pence||!available||!controller)return;pending.current=true;setBusy(true);setError('');
  try{
   if(!controller)throw Error('Wait for the secure payment fields to load.');
   await controller.confirm(donor,giftAid);
  }catch(e){setError((e as Error).message);pending.current=false;setBusy(false);}
 }
 function field(key:'firstName'|'lastName'|'email'|'phone',auto:string,type='text',required=true){return <label>{t(key)}{required&&<span className="donate-required" aria-hidden="true"> *</span>}<input name={key} type={type} autoComplete={auto} required={required} maxLength={key==='email'?254:key==='phone'?40:100} value={donor[key]} onChange={e=>update(key,e.target.value)}/></label>;}
 function addressField(key:keyof typeof donor.address,label:string,auto:string,required=false){return <label>{t(label)}{required&&<span className="donate-required" aria-hidden="true"> *</span>}<input name={key} autoComplete={auto} required={required} maxLength={key==='postcode'?30:200} value={donor.address[key]} onChange={e=>address(key,e.target.value)}/></label>;}
 return <div className="donate-form-wrap" id="donation-options"><form className="donate-form" onSubmit={submit} aria-busy={busy}>
  <Photo src={content.donation?.formImage||'/images/gathering.webp'} className="donate-cover"/>
  <header className="donate-cause"><h2>{t('cause')}</h2><span><LockKeyhole size={13}/>{t('secure')}</span></header>
  <fieldset className="donate-fields" disabled={busy}>
   {search.get('cancelled')==='1'&&<p className="donate-status" role="status">{t('return')}</p>}
   <section className="donate-section"><h3>{t('question')}</h3><p>{t('intro')}</p>
    <div className="donate-amount-label"><strong>{t('amount')}<span className="donate-required" aria-hidden="true"> *</span></strong><span>GBP £</span></div>
    <div className="donate-amounts" role="group" aria-label={t('amount')}>{['10','25','50','100','250','500'].map(value=><button type="button" key={value} aria-pressed={!custom&&amount===value} className={!custom&&amount===value?'selected':''} onClick={()=>{setAmount(value);setCustom('');amountChanged();}}>{money(Number(value)*100)}</button>)}</div>
    <label className="donate-custom"><span className="sr-only">{t('custom')}</span><input name="customAmount" inputMode="decimal" placeholder={t('custom')} value={custom} aria-describedby="donate-amount-help" onChange={e=>{setCustom(e.target.value);setAmount(e.target.value);amountChanged();}}/></label>
    <small id="donate-amount-help">Choose £1–£10,000, with up to two decimal places.</small>
    {!pence&&<p className="donate-error" role="alert">Enter a valid donation amount.</p>}
    {capabilities?.monthly&&<div className="donate-frequency" role="group" aria-label={t('frequency')}>{['once','monthly'].map(value=><button key={value} type="button" aria-pressed={frequency===value} className={frequency===value?'selected':''} onClick={()=>{setFrequency(value);amountChanged();}}>{t(value)}</button>)}</div>}
   </section>
   <section className="donate-section"><h3>{t('details')}</h3><div className="donate-row">{field('firstName','given-name')}{field('lastName','family-name')}</div>{field('phone','tel','tel',false)}{field('email','email','email')}</section>
   <section className="donate-section"><h3>{t('address')}</h3>{capabilities?.giftAid&&<p>For Gift Aid, please use your home address.</p>}<label>{t('country')}<span className="donate-required" aria-hidden="true"> *</span><select name="country" autoComplete="country" required value={donor.address.country} onChange={e=>address('country',e.target.value)}>{countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label>{addressField('line1','line1','address-line1',true)}{addressField('line2','line2','address-line2')}<div className="donate-row">{addressField('city','city','address-level2',true)}{addressField('region','region','address-level1')}</div>{addressField('postcode','postcode','postal-code',donor.address.country==='GB')}</section>
   <section className="donate-section"><h3>{t('payment')}</h3><p>{t('paymentIntro')}</p><div className="donate-summary"><h4>{t('summary')}</h4><dl><div><dt>{t('amount')}</dt><dd>{pence?money(pence):'—'}</dd></div><div><dt>{t('frequency')}</dt><dd>{t(frequency)}</dd></div><div className="donate-total"><dt>{t('total')}</dt><dd>{stripeTotal||(pence?money(pence):'—')}{frequency==='monthly'&&<small> / month</small>}</dd></div></dl></div><div className="donate-stripe"><div className="donate-stripe-heading"><CreditCard size={20}/><strong>{t('method')}</strong><ShieldCheck size={21}/></div><p>{t('methodNote')}</p>{available&&pence&&capabilities?.stripePublishableKey&&<StripeDonationPayment publishableKey={capabilities.stripePublishableKey} pence={pence} frequency={frequency} onReady={setController} onTotal={setStripeTotal}/>}</div>{frequency==='monthly'&&<p className="donate-recurring">{t('monthlyNote')}</p>}</section>
   <section className="donate-section donate-declaration"><h3>{t('declaration')}</h3>{capabilities?.giftAid&&donor.address.country==='GB'&&<label className="donate-gift-aid"><input type="checkbox" name="giftAid" checked={giftAid} onChange={e=>{setGiftAid(e.target.checked);changed();}}/><span>I want {content.settings.organisation} to claim Gift Aid on {frequency==='monthly'?'this donation and future donations under this monthly instruction':'this donation'}. I am a UK taxpayer. I understand that if my UK Income Tax and Capital Gains Tax for the tax year do not cover all Gift Aid claimed on my donations, I must pay the shortfall. I will tell the charity if my name, home address or tax circumstances change.</span></label>}<p>{t('privacy')}</p></section>
   {error&&<p className="donate-error" role="alert">{error}</p>}
   {!capabilities&&!unavailable&&<p role="status">Checking donation availability…</p>}
   {(unavailable||(capabilities&&!available))&&<p className="donate-status" role="status">Online donations are temporarily unavailable. <Link to="/contact?topic=Donations">Contact the team about a donation.</Link></p>}
   <button className="donate-submit" type="submit" disabled={!pence||!available||!controller||busy}>{busy?'Processing your donation…':t('submit')}</button>
   <p className="donate-charity">{content.settings.organisation} · Charity no. {content.settings.charityNumber}</p>
  </fieldset>
 </form></div>;
}
