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
export {default as DonationPanel} from './DonationForm';
