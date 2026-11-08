import { useSiteCopy } from "./SiteCopy";
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Globe2, HeartHandshake, Leaf, Mail, MapPin, Menu, Phone, Sparkles, Users, X } from 'lucide-react';
import { useContent } from './ContentContext';
import { emailHref, telephoneHref } from './lib';
import { backendEnabled, apiRequest } from './api';
export function Mark({
  large = false
}: {
  large?: boolean;
}) {
  const {content}=useContent();
  return <img className={`brand-mark official-mark ${large?'large':''}`} src={content.settings.logo||'/images/burhaniya-logo.png'} alt="" aria-hidden="true"/>;
}
export const Arrow = () => <ArrowUpRight size={19} aria-hidden="true" />;
export function ButtonLink({
  to,
  children,
  kind = 'primary',
  className = ''
}: {
  to: string;
  children: ReactNode;
  kind?: string;
  className?: string;
}) {
  return <Link className={`button ${kind} ${className}`} to={to}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}
export function SectionTitle({
  eyebrow,
  title,
  children,
  to,
  label
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  to?: string;
  label?: string;
}) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>{to && <Link className="text-link" to={to}>{label || 'Explore more'}<Arrow /></Link>}</div>;
}
export function Body({
  text
}: {
  text: string;
}) {
  return <div className="prose">{text.split('\n\n').map((p, i) => p.startsWith('## ') ? <div key={i}><h2>{p.split('\n')[0].slice(3)}</h2><p>{p.split('\n').slice(1).join('\n')}</p></div> : <p key={i}>{p}</p>)}</div>;
}
export function Photo({
  src,
  alt = '',
  className = '',
  eager = false
}: {
  src: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const {
    content
  } = useContent();
  const media = content.media.find(m => m.url === src);
  return <img className={className} src={src} alt={alt || media?.alt || 'Community website illustration'} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}
export function ProgrammeIcon({
  name
}: {
  name: string;
}) {
  const I = ({
    spark: Sparkles,
    book: BookOpen,
    heart: HeartHandshake,
    people: Users,
    leaf: Leaf,
    globe: Globe2
  } as Record<string, typeof Leaf>)[name] || Leaf;
  return <I size={25} strokeWidth={1.4} aria-hidden="true" />;
}
export function Header() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        document.getElementById('menu-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <><a className="skip-link" href="#main">{siteText("components.skip-to-content.0a4470", "Skip to content")}</a><div className="topline"><div className="container"><span><MapPin size={12} />{siteText("components.london-united-kingdom.742f70", " London, United Kingdom")}</span><span>{siteText("components.a-shared-path-a-welcoming-community-.9ce436", "A shared path. A welcoming community.")}</span><a href={emailHref(content.settings.email)}><Mail size={12} />{siteText("components.get-in-touch.c9ec74", " Get in touch")}</a></div></div><header className="site-header"><div className="container header-inner"><Link to="/" className="brand" aria-label={`${content.settings.name} home`}>{content.settings.logo ? <img className="custom-logo" src={content.settings.logo} alt="" /> : <Mark />}<span><strong>{content.settings.name}</strong><small>{siteText("components.community-wellbeing-belonging.e6b6c7", "Community · Wellbeing · Belonging")}</small></span></Link><button id="menu-toggle" className="menu-toggle" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><nav id="main-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label={siteText("components.main-navigation.efd197", "Main navigation")}>{[['/community', siteText("components.our-community.aa8fff", "Our community")], ['/what-we-do', siteText("components.what-we-do.a39b9d", "What we do")], ['/wellbeing', siteText("components.wellbeing.a85b23", "Wellbeing")], ['/gatherings', siteText("components.gatherings.43ca02", "Gatherings")], ['/stories', siteText("components.articles.7c4228", "Articles")], ['/gallery', siteText("components.gallery.9c30a3", "Gallery")]].map(([path, label]) => <NavLink key={path} to={path}>{label}</NavLink>)}<ButtonLink to="/contact?topic=First%20visit" kind="small">{siteText("components.plan-your-first-visit.dbf9b9", "Plan your first visit")}</ButtonLink></nav></div></header></>;
}
function Newsletter() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [email, setEmail] = useState(''),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [draft, setDraft] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setMessage('');
    if (!consent) {
      setError('Please confirm you would like to receive updates.');
      return;
    }
    if (!backendEnabled) {
      setDraft(emailHref(content.settings.email, 'Community email updates', `Please tell me how to receive community updates.\nMy email: ${email}`));
      setMessage('Your request is ready to send by email.');
      return;
    }
    setBusy(true);
    try {
      const data = await apiRequest('/newsletter/subscribe', {
        email,
        consent,
        website: ''
      });
      setMessage(data.message || 'Please check your inbox for the next step.');
      setEmail('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return <section className="newsletter"><div className="container newsletter-inner"><div><span className="eyebrow">{siteText("components.stay-connected.925338", "Stay connected")}</span><h2>{siteText("components.a-little-community-in-your-inbox-.b24c19", "A little community in your inbox.")}</h2><p>{siteText("components.ask-to-hear-about-gatherings-news-and-ways-to-get-invol.6c0cc9", "Ask to hear about gatherings, news and ways to get involved.")}</p></div><form onSubmit={submit} className="newsletter-form"><label className="sr-only" htmlFor="newsletter-email">{siteText("components.your-email-address.e1b179", "Your email address")}</label><div className="newsletter-input"><input id="newsletter-email" type="email" placeholder={siteText("components.your-email-address.e1b179", "Your email address")} value={email} onChange={e => {
            setEmail(e.target.value);
            setDraft('');
          }} required disabled={busy} /><button type="submit" aria-label={siteText("components.request-community-updates.f3fe8b", "Request community updates")} disabled={busy}><ArrowRight size={22} /></button></div><label className="checkbox-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />{siteText("components.i-would-like-to-receive-community-updates-.66557f", "I would like to receive community updates.")}</label>{message && <p role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}{draft && <a className="text-link" href={draft}>{siteText("components.open-email-to-send-your-request.4b6f95", "Open email to send your request")}<Arrow /></a>}{!backendEnabled && <small>{siteText("components.updates-are-requested-by-email-during-this-preview-.7fa87b", "Updates are requested by email during this preview.")}</small>}</form></div></section>;
}
export function Footer() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const s = content.settings;
  return <><Newsletter /><footer className="footer"><div className="container"><div className="footer-top"><div className="footer-about"><Link className="brand" to="/" aria-label={siteText("components.back-to-home.34ac37", "Back to home")}><Mark /><span><strong>{s.name}</strong></span></Link><p>{s.footerText}</p><span className="footer-registration">{s.organisation}{siteText("components.-charity-no-.de9543", " · Charity no. ")}{s.charityNumber}</span></div><nav aria-label={siteText("components.footer-explore.5c748a", "Footer explore")}><h2>{siteText("components.explore.b965ae", "Explore")}</h2>{[['/community', siteText("components.our-community.aa8fff", "Our community")], ['/what-we-do', siteText("components.what-we-do.a39b9d", "What we do")], ['/wellbeing', siteText("components.spiritual-wellbeing.1a983d", "Spiritual wellbeing")], ['/gatherings', siteText("components.events-gatherings.070129", "Events & gatherings")], ['/stories', siteText("components.articles-news.258886", "Articles & news")], ['/gallery', siteText("components.community-gallery.cba727", "Community gallery")]].map(([path, label]) => <Link key={path} to={path}>{label}</Link>)}</nav><nav aria-label={siteText("components.footer-take-part.786325", "Footer take part")}><h2>{siteText("components.take-part.f1fa8f", "Take part")}</h2><Link to="/contact?topic=First%20visit">{siteText("components.plan-your-first-visit.dbf9b9", "Plan your first visit")}</Link><Link to="/get-involved">{siteText("components.volunteer-with-us.455794", "Volunteer with us")}</Link><Link to="/donate">{siteText("components.make-a-donation.c9d28c", "Make a donation")}</Link><Link to="/contact">{siteText("components.contact-the-team.78dadf", "Contact the team")}</Link></nav><div className="footer-contact"><h2>{siteText("components.find-us.d561f1", "Find us")}</h2><address>{s.address}<a href={telephoneHref(s.phone)}>{s.phone}</a><a href={emailHref(s.email)}>{s.email}</a></address><a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noreferrer noopener">{siteText("components.get-directions.648d80", "Get directions")}<Arrow /></a></div></div><div className="footer-bottom"><span>{siteText("components.-.4ac328", "© ")}{new Date().getFullYear()} {s.organisation}{siteText("components.-all-rights-reserved-.8c8e38", ". All rights reserved.")}</span><span>{siteText("components.community-wellbeing-belonging.e6b6c7", "Community · Wellbeing · Belonging")}</span><Link to="/admin">{siteText("components.content-studio.45c55e", "Content studio")}</Link></div></div></footer></>;
}
export function Invitation() {
  const siteText = useSiteCopy();
  return <section className="invitation container"><div><span className="eyebrow">{siteText("components.the-door-is-open.9786af", "The door is open")}</span><h2>{siteText("components.your-next-step.914033", "Your next step")}<br />{siteText("components.can-be-a-simple.940746", "can be a simple ")}<em>{siteText("components.hello-.19bd43", "hello.")}</em></h2></div><div><p>{siteText("components.you-do-not-need-to-have-it-all-figured-out-get-in-touch.e5be25", "You do not need to have it all figured out. Get in touch, ask a question, and let us help you find your way.")}</p><ButtonLink to="/contact">{siteText("components.start-a-conversation.244c20", "Start a conversation")}</ButtonLink></div><Mark large /></section>;
}
export function PageHero({
  page
}: {
  page: keyof ReturnType<typeof useContent>['content']['pages'];
}) {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const p = content.pages[page];
  return <section className="page-hero container"><div><Link className="breadcrumb" to="/">{siteText("components.home.2247d5", "Home ")}<span>{siteText("components.-.42099b", "/")}</span></Link><span className="eyebrow">{p.eyebrow}</span><h1>{p.title}</h1><p>{p.intro}</p></div><div className="page-hero-image"><Photo src={p.image} eager /><span className="image-label">{siteText("components.reflection-connection-belonging-.d24ed0", "Reflection. Connection. Belonging.")}</span></div></section>;
}
export function Faq({
  items
}: {
  items: {
    question: string;
    answer: string;
  }[];
}) {
  return <div className="faq">{items.map(item => <details key={item.question}><summary>{item.question}<ChevronDown size={18} /></summary><p>{item.answer}</p></details>)}</div>;
}
