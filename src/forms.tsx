import { useSiteCopy } from "./SiteCopy";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, HeartHandshake, LockKeyhole, Mail } from 'lucide-react';
import { useContent } from './ContentContext';
import { apiRequest, backendEnabled } from './api';
import { createId, donationPence, emailHref } from './lib';
export function EnquiryForm({
  topic: initialTopic = 'General enquiry',
  eventSlug
}: {
  topic?: string;
  eventSlug?: string;
}) {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [search] = useSearchParams();
  const options = ['First visit', 'Spiritual wellbeing', 'Volunteering', 'Donations', 'Event registration', 'General enquiry'];
  const requested = search.get('topic') || initialTopic;
  const [topic, setTopic] = useState(options.includes(requested) ? requested : 'General enquiry');
  const [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [message, setMessage] = useState(''),
    [consent, setConsent] = useState(false),
    [status, setStatus] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState('');
  const id = useRef(createId()),
    pending = useRef(false);
  useEffect(() => {
    setTopic(options.includes(requested) ? requested : 'General enquiry');
    setDraft('');
  }, [requested]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    setError('');
    setStatus('');
    setDraft('');
    const form = new FormData(e.currentTarget);
    if (form.get('website')) {
      setError('Please check the form and try again.');
      return;
    }
    if (!consent) {
      setError('Please confirm we can use your details to reply.');
      return;
    }
    if (!backendEnabled) {
      setDraft(emailHref(content.settings.email, `${topic}${eventSlug ? ' · ' + eventSlug : ''}`, `Name: ${name}\nEmail: ${email}\nEnquiry: ${topic}\n${eventSlug ? 'Gathering: ' + eventSlug + '\n' : ''}\n${message}`));
      setStatus('Your enquiry is ready. Open your email app below to send it to the team.');
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      const result = await apiRequest(eventSlug ? `/events/${encodeURIComponent(eventSlug)}/interest` : '/contact', {
        submissionId: id.current,
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        consent,
        website: ''
      });
      setStatus(result.message || 'Your enquiry has been received.');
      setName('');
      setEmail('');
      setMessage('');
      id.current = createId();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      pending.current = false;
    }
  }
  return <form className="enquiry-form" onSubmit={submit} aria-busy={busy}><div className="form-row"><label>{siteText("forms.your-name.ab4229", "Your name")}<input name="name" value={name} onChange={e => {
          setName(e.target.value);
          setDraft('');
        }} autoComplete="name" required maxLength={100} disabled={busy} /></label><label>{siteText("forms.email-address.c94d31", "Email address")}<input name="email" type="email" value={email} onChange={e => {
          setEmail(e.target.value);
          setDraft('');
        }} autoComplete="email" required maxLength={254} disabled={busy} /></label></div><label>{siteText("forms.what-would-you-like-to-talk-about-.fa3b48", "What would you like to talk about?")}<select value={topic} onChange={e => {
        setTopic(e.target.value);
        setDraft('');
      }} disabled={busy}>{options.map(option => <option key={option}>{option}</option>)}</select></label><label>{siteText("forms.your-message.f190c9", "Your message")}<textarea name="message" value={message} onChange={e => {
        setMessage(e.target.value);
        setDraft('');
      }} required minLength={10} maxLength={5000} rows={5} placeholder={siteText("forms.tell-us-a-little-about-what-brings-you-here-.4bb1ed", "Tell us a little about what brings you here…")} disabled={busy} /></label><label className="honeypot" aria-hidden="true">{siteText("forms.leave-this-field-empty.5826b1", "Leave this field empty")}<input name="website" tabIndex={-1} autoComplete="off" /></label><label className="checkbox-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required disabled={busy} />{siteText("forms.i-agree-that-the-team-may-use-these-details-to-respond-.d27251", "I agree that the team may use these details to respond to my enquiry.")}</label>{error && <p role="alert" className="notice error">{error}</p>}{status && <p role="status" className="notice success"><CheckCircle2 size={19} />{status}</p>}{draft ? <a className="button primary" href={draft}>{siteText("forms.open-email-to-send.86d38a", "Open email to send")}<Mail size={18} /></a> : <button className="button primary" type="submit" disabled={busy}>{busy ? 'Sending…' : backendEnabled ? 'Send your enquiry' : 'Prepare email enquiry'}<ArrowRight size={18} /></button>}<p className="form-note">{backendEnabled ? 'Please share only information needed to answer your enquiry.' : 'This preview prepares an email draft. Nothing is submitted until you send it from your email app.'}</p></form>;
}
export function DonationPanel() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [amount, setAmount] = useState('25'),
    [frequency, setFrequency] = useState('once'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const requestId = useRef(createId());
  const [capabilities, setCapabilities] = useState<{payments:boolean;monthly:boolean}|null>(null);
  const [availabilityError, setAvailabilityError] = useState(false);
  useEffect(() => { let active = true; apiRequest('/capabilities').then(data => { if (active) setCapabilities({payments:data.payments === true,monthly:data.monthly === true}); }).catch(() => { if (active) setAvailabilityError(true); }); return () => { active = false; }; }, []);
  useEffect(() => { if (capabilities && !capabilities.monthly) setFrequency('once'); }, [capabilities]);
  const pence = donationPence(amount);
  async function checkout(e: FormEvent) {
    e.preventDefault();
    if (!pence || busy || !capabilities?.payments) return;
    setError('');
    if (!backendEnabled) return;
    setBusy(true);
    try {
      const data = await apiRequest('/donations/checkout', {
        amountPence: pence,
        currency: 'gbp',
        frequency,
        submissionId: requestId.current
      });
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password) throw Error('The payment service returned an invalid checkout link.');
      window.location.assign(url.href);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return <div className="donation-layout" id="donation-options"><div><span className="eyebrow">{siteText("forms.give-with-purpose.132518", "Give with purpose")}</span><h2>{siteText("forms.a-little-generosity-.5f05c4", "A little generosity.")}<br />{siteText("forms.a-lasting-connection-.9e8f7a", "A lasting connection.")}</h2><p>{siteText("forms.support-a-community-committed-to-learning-wellbeing-and.530d8c", "Support a community committed to learning, wellbeing and practical care. Every contribution begins with a shared intention to help.")}</p><ul className="check-list"><li><Check size={18} />{siteText("forms.community-connection-and-belonging.c2a5db", "Community connection and belonging")}</li><li><Check size={18} />{siteText("forms.education-and-personal-growth.6da53f", "Education and personal growth")}</li><li><Check size={18} />{siteText("forms.practical-support-for-people-facing-hardship.8bc1ec", "Practical support for people facing hardship")}</li></ul><Link className="text-link" to="/what-we-do">{siteText("forms.explore-our-areas-of-work.6e9b5a", "Explore our areas of work")}<ArrowRight size={17} /></Link></div><form className="donation-card" onSubmit={checkout}><div className="donation-steps"><span>{siteText("forms.1-choose-your-gift.508c36", "1 · Choose your gift")}</span><span>{siteText("forms.2-secure-stripe-checkout.7991a7", "2 · Secure Stripe checkout")}</span></div><HeartHandshake size={30} strokeWidth={1.4} /><h3>{siteText("forms.support-the-community.cd0f51", "Support the community")}</h3><p>{siteText("forms.choose-the-contribution-you-would-like-to-make-.f876be", "Choose the contribution you would like to make.")}</p><div className="segmented" role="group" aria-label={siteText("forms.donation-frequency.6a33fa", "Donation frequency")}>{[['once', 'One-off'], ...(capabilities?.monthly ? [['monthly', 'Monthly']] : [])].map(([value, label]) => <button type="button" disabled={busy} aria-pressed={frequency === value} key={value} onClick={() => {
          setFrequency(value);
          requestId.current = createId();
        }} className={frequency === value ? 'selected' : ''}>{label}</button>)}</div><div className="amounts" role="group" aria-label={siteText("forms.suggested-donation-amount.fb6990", "Suggested donation amount")}>{['10', '25', '50', '100'].map(value => <button type="button" disabled={busy} key={value} aria-pressed={amount === value} onClick={() => {
          setAmount(value);
          requestId.current = createId();
        }} className={amount === value ? 'selected' : ''}>{siteText("forms.-.0c065e", "£")}{value}</button>)}</div><label>{siteText("forms.or-choose-an-amount-.e92dc8", "Or choose an amount (£)")}<input type="text" inputMode="decimal" disabled={busy} value={amount} onChange={e => {
          setAmount(e.target.value);
          requestId.current = createId();
        }} required aria-describedby="amount-help" /></label><small id="amount-help">{siteText("forms.choose-1-10-000-with-up-to-two-decimal-places-.bc7e78", "Choose £1–£10,000, with up to two decimal places.")}</small>{!pence && <p className="error" role="alert">{siteText("forms.enter-a-valid-amount-.b0e59c", "Enter a valid amount.")}</p>}{error && <p className="notice error" role="alert">{error}</p>}<div className="donation-summary"><div><span>{frequency === 'monthly' ? 'Monthly donation' : 'One-off donation'}</span><strong>{pence ? new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP'
            }).format(pence / 100) : '—'}</strong></div><LockKeyhole size={24} /></div><p className="form-note">{frequency === 'monthly' ? 'Your chosen amount will repeat each month until cancelled. Contact the team for help with your subscription.' : 'A single contribution to support our community.'}</p>{!capabilities && !availabilityError && <p className="form-note" role="status">{siteText('forms.checking-donations', 'Checking donation availability…')}</p>}{(availabilityError || capabilities?.payments === false) && <p className="form-note" role="status">{siteText('forms.donations-unavailable', 'Online donations are temporarily unavailable.')} <Link to="/contact?topic=Donations">{siteText('forms.contact-about-donation', 'Contact the team about a donation.')}</Link></p>}{backendEnabled ? <button type="submit" className="button primary" disabled={busy || !pence || !capabilities?.payments}>{busy ? 'Opening checkout…' : `Donate ${pence ? new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP'
        }).format(pence / 100) : 'your donation'} securely`}<LockKeyhole size={16} /></button> : <><p className="form-note">{siteText("forms.online-payments-are-not-open-in-this-preview-contact-th.e3b1a3", "Online payments are not open in this preview. Contact the team to ask about donating.")}</p><a className={`button primary ${!pence ? 'disabled' : ''}`} aria-disabled={!pence} href={pence ? emailHref(content.settings.email, 'Donation enquiry', `I would like to ask about a ${frequency === 'monthly' ? 'monthly' : 'one-off'} donation of £${(pence / 100).toFixed(2)}.`) : undefined}>{siteText("forms.ask-about-donating.f427f9", "Ask about donating")}<ArrowRight size={17} /></a></>}<p className="donation-secure">{siteText("forms.card-details-are-entered-on-stripe-s-secure-checkout-we.ef8cd0", "Card details are entered on Stripe’s secure checkout. We do not store your card details.")}</p><small className="donation-footnote">{content.settings.organisation}{siteText("forms.-charity-no-.de9543", " · Charity no. ")}{content.settings.charityNumber}</small></form></div>;
}
