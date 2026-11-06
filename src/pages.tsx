import { useSiteCopy } from "./SiteCopy";
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Clock3, Heart, Leaf, Mail, MapPin, Phone, Sparkles, Users } from 'lucide-react';
import { useContent } from './ContentContext';
import { Body, ButtonLink, Faq, Invitation, Mark, PageHero, Photo, ProgrammeIcon, SectionTitle } from './components';
import { DonationPanel, EnquiryForm } from './forms';
import HeroSlider from './HeroSlider';
import { emailHref, formatDate, telephoneHref } from './lib';
import { apiRequest, backendEnabled } from './api';
import type { Gathering, Programme, Story } from './types';
function ProgrammeCard({
  item,
  index
}: {
  item: Programme;
  index: number;
}) {
  const siteText = useSiteCopy();
  return <Link className="programme-card" to={`/what-we-do/${item.slug}`}><div className="card-image"><Photo src={item.image} /><span className="card-number">{siteText("pages.0.b6589f", "0")}{index + 1}</span></div><div className="card-copy"><h3>{item.title}<ArrowUpRight size={22} /></h3><p>{item.summary}</p></div></Link>;
}
function StoryCard({
  item
}: {
  item: Story;
}) {
  return <article className="story-card"><Link to={`/stories/${item.slug}`} tabIndex={-1} aria-hidden="true"><Photo src={item.image} /></Link><div className="story-meta"><span>{item.category}</span><span>{item.readTime}</span></div><h3><Link to={`/stories/${item.slug}`}>{item.title}<ArrowUpRight size={21} /></Link></h3><p>{item.summary}</p></article>;
}
function GatheringRow({
  item,
  index
}: {
  item: Gathering;
  index: number;
}) {
  const siteText = useSiteCopy();
  return <Link className="gathering-row" to={`/gatherings/${item.slug}`}><div className="gathering-number">{item.date ? <><strong>{new Date(item.date + 'T12:00:00Z').getUTCDate()}</strong><span>{new Intl.DateTimeFormat('en-GB', {
            month: 'short'
          }).format(new Date(item.date + 'T12:00:00Z'))}</span></> : <><strong>{siteText("pages.0.b6589f", "0")}{index + 1}</strong><span>{siteText("pages.explore.b965ae", "Explore")}</span></>}</div><div><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p></div><div className="gathering-when"><span><Clock3 size={15} />{item.date ? formatDate(item.date) : 'Schedule to be confirmed'}</span><span><MapPin size={15} />{item.location}</span>{item.sample && <small>{siteText("pages.illustrative-listing.061d03", "Illustrative listing")}</small>}</div><span className="round-arrow"><ArrowUpRight size={22} /></span></Link>;
}
export function HomePage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const h = content.home;
  return <>
  <HeroSlider />
  <section className="first-step-strip"><div className="container first-step-inner"><div><span className="eyebrow">{siteText("pages.new-here-start-with-a-hello-.b45298", "New here? Start with a hello.")}</span><p>{siteText("pages.no-prior-knowledge-needed-ask-a-question-meet-the-peopl.4f9153", "No prior knowledge needed. Ask a question, meet the people, find your own pace.")}</p></div><Link className="text-link" to="/stories/a-guide-to-your-first-visit">{siteText("pages.what-to-expect-on-a-first-visit.8232a6", "What to expect on a first visit")}<ArrowRight size={20} /></Link></div></section>
  <section className="container welcome-section section-space" id="welcome"><div className="welcome-visual"><Photo src={h.welcomeImage} /><span className="vertical-caption">{siteText("pages.a-place-to-pause-a-place-to-belong-.80b430", "A place to pause. A place to belong.")}</span><div className="welcome-seal"><Mark /><span>{siteText("pages.open-hearts-.420ea0", "Open hearts.")}<br />{siteText("pages.shared-purpose-.ca11ec", "Shared purpose.")}</span></div></div><div className="welcome-copy"><span className="eyebrow">{siteText("pages.welcome-to-our-community.b21c0a", "Welcome to our community")}</span><h2>{h.welcomeTitle}</h2><Body text={h.welcomeBody} /><ButtonLink to="/community" kind="outline">{siteText("pages.our-story-values.e63005", "Our story & values")}</ButtonLink></div></section>
  <section className="soft-section section-space" id="explore"><div className="container"><SectionTitle eyebrow={siteText("pages.find-your-way-in.64cc42", "Find your way in")} title={siteText("pages.what-brings-you-here-.0d640b", "What brings you here?")} to="/what-we-do" label={siteText("pages.explore-our-work.cccf86", "Explore our work")}>{siteText("pages.you-might-be-looking-for-company-space-to-reflect-or-a-.a03895", "You might be looking for company, space to reflect, or a way to contribute. There is more than one place to begin.")}</SectionTitle><div className="community-paths">
    {[{
            image: h.welcomeImage,
            n: '01',
            title: 'Meet people. Feel connected.',
            body: 'Come for a conversation. Discover gatherings and community life across generations and backgrounds.',
            to: '/gatherings',
            link: 'Explore gatherings'
          }, {
            image: content.pages.wellbeing.image,
            n: '02',
            title: 'Pause. Reflect. Reconnect.',
            body: 'Find a little room for calm, shared reflection and thoughtful conversation, at your own pace.',
            to: '/wellbeing',
            link: 'Explore wellbeing'
          }, {
            image: content.pages.programmes.image,
            n: '03',
            title: 'Learn. Grow. Give something back.',
            body: 'Explore learning, practical care and ways to share your time or skills with the community.',
            to: '/what-we-do',
            link: 'See what we do'
          }].map(path => <Link className="community-path" to={path.to} key={path.n}><div className="path-photo"><Photo src={path.image} /><span>{path.n}</span></div><div className="path-copy"><h3>{path.title}</h3><p>{path.body}</p><span className="text-link">{path.link}<ArrowUpRight size={20} /></span></div></Link>)}
  </div></div></section>
  <section className="container visit-journey section-space" id="first-visit"><div className="visit-intro"><span className="eyebrow">{siteText("pages.your-first-visit-made-simple.509f29", "Your first visit, made simple")}</span><h2>{siteText("pages.a-small-step-.57eb97", "A small step.")}<br /><em>{siteText("pages.a-new-connection-.2d7f61", "A new connection.")}</em></h2><p>{siteText("pages.you-can-be-curious-without-committing-to-anything-we-wi.818efd", "You can be curious without committing to anything. We will help you work out where to begin.")}</p><ButtonLink to="/contact?topic=First%20visit">{siteText("pages.plan-your-first-visit.dbf9b9", "Plan your first visit")}</ButtonLink></div><ol className="visit-steps"><li><span>{siteText("pages.01.ddfe16", "01")}</span><div><h3>{siteText("pages.say-hello-to-the-team.6b030f", "Say hello to the team")}</h3><p>{siteText("pages.tell-us-what-interests-you-ask-your-questions-and-menti.669d79", "Tell us what interests you. Ask your questions and mention anything that would make visiting easier.")}</p></div></li><li><span>{siteText("pages.02.bcac9d", "02")}</span><div><h3>{siteText("pages.find-a-gathering-that-fits.96d5af", "Find a gathering that fits")}</h3><p>{siteText("pages.confirm-the-current-dates-location-and-what-to-expect-d.ddfaaf", "Confirm the current dates, location and what to expect directly with the team before travelling.")}</p></div></li><li><span>{siteText("pages.03.3ea6c9", "03")}</span><div><h3>{siteText("pages.come-along-at-your-own-pace.8e8d91", "Come along, at your own pace")}</h3><p>{siteText("pages.meet-people-listen-and-get-a-feel-for-the-community-dec.e85af2", "Meet people, listen and get a feel for the community. Decide your next step in your own time.")}</p></div></li></ol></section>
  <section className="reflection-panel"><div className="container reflection-inner"><div><span className="eyebrow light">{siteText("pages.spiritual-healing-wellbeing.1f91e7", "Spiritual healing & wellbeing")}</span><h2>{siteText("pages.find-a-quieter-moment-.13fdc7", "Find a quieter moment.")}<br /><em>{siteText("pages.discover-a-deeper-connection-.914fab", "Discover a deeper connection.")}</em></h2></div><div><p>{siteText("pages.explore-spiritual-reflection-remembrance-and-compassion.3f1367", "Explore spiritual reflection, remembrance and compassionate conversation. There is room for your questions, and time to find your own way.")}</p><ButtonLink to="/wellbeing" kind="cream">{siteText("pages.explore-spiritual-wellbeing.04cae0", "Explore spiritual wellbeing")}</ButtonLink></div><Mark large /></div></section>
  <section className="container section-space"><SectionTitle eyebrow={siteText("pages.come-together.af43c6", "Come together")} title={siteText("pages.your-invitation-to-take-part-.f13d9e", "Your invitation to take part.")} to="/gatherings" label={siteText("pages.explore-gatherings.b140a0", "Explore gatherings")}>{siteText("pages.discover-ways-to-meet-the-community-contact-us-for-curr.6297df", "Discover ways to meet the community. Contact us for current dates and visiting arrangements.")}</SectionTitle><div>{content.gatherings.slice(0, 3).map((e, i) => <GatheringRow item={e} index={i} key={e.id} />)}</div></section>
  <section className="container section-space stories-home"><SectionTitle eyebrow={siteText("pages.from-our-community.582b92", "From our community")} title={siteText("pages.ideas-to-carry-with-you-.41bbe2", "Ideas to carry with you.")} to="/stories" label={siteText("pages.all-stories-guides.a56df3", "All stories & guides")} /><div className="story-grid">{content.stories.slice(0, 3).map(story => <StoryCard key={story.id} item={story} />)}</div></section>{(content.galleries || []).length > 0 && <section className="gallery-home"><div className="container"><SectionTitle eyebrow={content.pages.gallery.eyebrow} title={content.pages.gallery.title} to="/gallery" label={siteText("pages.explore-the-gallery.a8d4a0", "Explore the gallery")}>{content.pages.gallery.intro}</SectionTitle><div className="gallery-albums">{(content.galleries || []).slice(0, 3).map(album => <Link to={'/gallery/' + album.slug} key={album.id}><Photo src={content.media.find(m => m.id === album.mediaIds[0])?.url || content.home.heroImage} /><h2>{album.title}</h2><p>{album.description}</p></Link>)}</div></div></section>}<section className="support-together"><div className="container support-inner"><div><span className="eyebrow light">{siteText("pages.when-you-are-ready-to-give-back.0742b7", "When you are ready to give back")}</span><h2>{siteText("pages.be-part-of.9fb2fc", "Be part of")}<br /><em>{siteText("pages.something-good-.0f11d5", "something good.")}</em></h2><p>{siteText("pages.already-feel-connected-help-make-that-welcome-possible-.2fe912", "Already feel connected? Help make that welcome possible for someone else. Share your time, your skills or a contribution.")}</p></div><div className="support-actions"><ButtonLink to="/get-involved" kind="cream">{siteText("pages.explore-volunteering.599d34", "Explore volunteering")}</ButtonLink><ButtonLink to="/donate" kind="outline">{siteText("pages.support-with-a-donation.53d7d3", "Support with a donation")}</ButtonLink><Link className="hero-text-link" to="/contact?topic=First%20visit">{siteText("pages.just-getting-to-know-us-plan-a-visit.ffe848", "Just getting to know us? Plan a visit")}<ArrowRight size={19} /></Link></div></div></section>
  </>;
}
export function CommunityPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  return <><PageHero page="community" /><section className="container editorial-section section-space"><div><span className="eyebrow">{siteText("pages.our-story.5a2d8e", "Our story")}</span><h2>{siteText("pages.spiritual-values-.aed0d2", "Spiritual values.")}<br />{siteText("pages.everyday-compassion-.dbf8e1", "Everyday compassion.")}</h2></div><Body text={content.pages.community.body} /></section><section className="soft-section section-space"><div className="container"><SectionTitle eyebrow={siteText("pages.what-guides-us.e30120", "What guides us")} title={siteText("pages.values-we-put-into-practice-.63976b", "Values we put into practice.")} /><div className="value-list">{[[siteText("pages.compassion.1bbc6c", "Compassion"), siteText("pages.make-space-for-kindness-particularly-when-people-are-fa.641339", "Make space for kindness, particularly when people are facing hardship.")], [siteText("pages.dignity-respect.f19ef4", "Dignity & respect"), siteText("pages.meet-each-person-with-care-for-their-choices-experience.a95ee0", "Meet each person with care for their choices, experiences and potential.")], [siteText("pages.connection-belonging.09407c", "Connection & belonging"), siteText("pages.bring-people-together-across-generations-cultures-and-b.77ddd3", "Bring people together across generations, cultures and backgrounds.")], [siteText("pages.learning-growth.ec19c4", "Learning & growth"), siteText("pages.encourage-the-confidence-and-skills-that-help-people-mo.86d222", "Encourage the confidence and skills that help people move forward.")], [siteText("pages.spiritual-wellbeing.1a983d", "Spiritual wellbeing"), siteText("pages.make-room-for-reflection-moral-support-and-thoughtful-c.629b1b", "Make room for reflection, moral support and thoughtful conversation.")], [siteText("pages.integrity-responsibility.5e8e37", "Integrity & responsibility"), siteText("pages.act-with-care-openness-and-respect-for-the-trust-placed.f1dd5a", "Act with care, openness and respect for the trust placed in us.")]].map(([title, body], i) => <div key={title}><span>{siteText("pages.0.b6589f", "0")}{i + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div></div></section><section className="container split-section section-space"><Photo src={content.pages.programmes.image} /><div><span className="eyebrow">{siteText("pages.a-shared-purpose.b0dd45", "A shared purpose")}</span><h2>{siteText("pages.care-for-each-other-.b0adf0", "Care for each other.")}<br />{siteText("pages.contribute-to-something-more-.86f44d", "Contribute to something more.")}</h2><p>{siteText("pages.our-work-brings-community-life-education-and-practical-.655792", "Our work brings community life, education and practical support together, with particular care for people facing hardship or isolation.")}</p><ButtonLink to="/what-we-do" kind="outline">{siteText("pages.see-what-we-do.a81ff6", "See what we do")}</ButtonLink></div></section><Invitation /></>;
}
export function ProgrammesPage() {
  const {
    content
  } = useContent();
  return <><PageHero page="programmes" /><section className="container section-space"><p className="section-intro">{content.pages.programmes.body}</p><div className="programme-grid">{content.programmes.map((p, i) => <ProgrammeCard item={p} index={i} key={p.id} />)}</div></section><Invitation /></>;
}
export function ProgrammeDetailPage() {
  const siteText = useSiteCopy();
  const {
    slug
  } = useParams();
  const {
    content
  } = useContent();
  const item = content.programmes.find(p => p.slug === slug);
  if (!item) return <NotFoundPage />;
  return <><section className="detail-heading container"><Link className="text-link" to="/what-we-do">{siteText("pages.-what-we-do.a3f9c9", "← What we do")}</Link><div className="detail-icon"><ProgrammeIcon name={item.icon} /></div><span className="eyebrow">{siteText("pages.care-in-action.08f8d7", "Care in action")}</span><h1>{item.title}</h1><p>{item.summary}</p></section><div className="container detail-cover"><Photo src={item.image} eager /></div><section className="container article-layout section-space"><Body text={item.body} /><aside className="aside-card"><span className="eyebrow">{siteText("pages.find-your-next-step.795573", "Find your next step")}</span><h2>{siteText("pages.let-s-talk-about-it-.61b45b", "Let's talk about it.")}</h2><p>{siteText("pages.ask-about-current-activities-support-and-how-you-can-ta.432fcb", "Ask about current activities, support and how you can take part.")}</p><ButtonLink to="/contact">{siteText("pages.contact-the-team.78dadf", "Contact the team")}</ButtonLink></aside></section><Invitation /></>;
}
export function WellbeingPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  return <><PageHero page="wellbeing" /><section className="container editorial-section section-space"><div><span className="eyebrow">{siteText("pages.at-your-own-pace.b3088d", "At your own pace")}</span><h2>{siteText("pages.a-thoughtful-path.ea8855", "A thoughtful path")}<br />{siteText("pages.towards-connection-.258eec", "towards connection.")}</h2></div><Body text={content.pages.wellbeing.body} /></section><section className="soft-section section-space"><div className="container"><div className="three-paths">{[{
            I: Leaf,
            n: 'Reflection',
            t: 'Create a little space to pause, listen and consider what matters to you.'
          }, {
            I: Sparkles,
            n: 'Remembrance',
            t: 'Ask about the Burhaniya tradition and opportunities for shared spiritual remembrance.'
          }, {
            I: Users,
            n: 'Conversation',
            t: 'Explore your questions with a community that values compassionate listening.'
          }].map(({
            I,
            n,
            t
          }, i) => <div key={n}><span className="path-number">{siteText("pages.0.b6589f", "0")}{i + 1}</span><I size={32} strokeWidth={1.2} /><h2>{n}</h2><p>{t}</p></div>)}</div><p className="care-note">{siteText("pages.spiritual-and-pastoral-support-does-not-replace-medical.4edf0b", "Spiritual and pastoral support does not replace medical or mental health treatment. Please seek professional healthcare when you need it.")}</p></div></section><section className="container faq-section section-space"><SectionTitle eyebrow={siteText("pages.before-you-visit.6d018c", "Before you visit")} title={siteText("pages.a-little-reassurance-.73451e", "A little reassurance.")} /><Faq items={[{
        question: 'Do I need to know about the Burhaniya tradition?',
        answer: 'No prior knowledge is needed to make an enquiry. Ask the team about the tradition, what to expect and how to take part.'
      }, {
        question: 'Can I ask questions before attending?',
        answer: 'Of course. Contact us before visiting so we can talk through the arrangements and answer your questions.'
      }, {
        question: 'What happens at a gathering?',
        answer: 'The format depends on the activity. The team can explain the next gathering, any participation guidance and the practical arrangements before you travel.'
      }, {
        question: 'How do I discuss accessibility or individual needs?',
        answer: 'Please contact the team in advance. Let us know what would make a visit easier so we can confirm available arrangements.'
      }]} /></section><Invitation /></>;
}
export function GatheringsPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(content.gatherings.map(e => e.category))];
  const items = content.gatherings.filter(e => filter === 'All' || e.category === filter);
  return <><PageHero page="gatherings" /><section className="container section-space"><p className="section-intro">{content.pages.gatherings.body}</p><div className="filter-bar" role="group" aria-label={siteText("pages.filter-gatherings.3798c9", "Filter gatherings")}>{categories.map(category => <button key={category} className={filter === category ? 'selected' : ''} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div>{items.length ? items.map((item, i) => <GatheringRow key={item.id} item={item} index={i} />) : <p role="status" className="empty-state">{siteText("pages.no-gatherings-in-this-category-contact-the-team-to-ask-.82b328", "No gatherings in this category. Contact the team to ask about current activities.")}</p>}</section><Invitation /></>;
}
export function GatheringDetailPage() {
  const siteText = useSiteCopy();
  const {
    slug
  } = useParams();
  const {
    content
  } = useContent();
  const item = content.gatherings.find(e => e.slug === slug);
  if (!item) return <NotFoundPage />;
  return <><section className="detail-heading container"><Link className="text-link" to="/gatherings">{siteText("pages.-events-gatherings.33250e", "← Events & gatherings")}</Link><span className="eyebrow">{item.category}</span><h1>{item.title}</h1><p>{item.summary}</p>{item.sample && <span className="sample-pill">{siteText("pages.illustrative-listing-confirm-details-with-the-team.5971ee", "Illustrative listing · confirm details with the team")}</span>}</section><section className="container detail-cover"><Photo src={item.image} eager /></section><section className="container article-layout section-space"><div><h2>{siteText("pages.a-moment-to-connect-.81d1d4", "A moment to connect.")}</h2><Body text={item.body} /><dl className="event-facts"><div><dt><Clock3 size={17} />{siteText("pages.when.769bb1", "When")}</dt><dd>{formatDate(item.date)}<br />{item.time}</dd></div><div><dt><MapPin size={17} />{siteText("pages.where.525f61", "Where")}</dt><dd>{item.location}</dd></div></dl></div><aside className="aside-card"><h2>{siteText("pages.ask-about-this-gathering.1f20e5", "Ask about this gathering")}</h2><p>{siteText("pages.send-an-enquiry-to-confirm-the-arrangements-this-form-d.5fba51", "Send an enquiry to confirm the arrangements. This form does not reserve a place.")}</p><EnquiryForm topic="Event registration" eventSlug={item.slug} /></aside></section></>;
}
export function StoriesPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(content.stories.map(s => s.category))];
  const shown = content.stories.filter(s => filter === 'All' || s.category === filter);
  return <><PageHero page="stories" /><section className="container section-space"><p className="section-intro">{content.pages.stories.body}</p><div className="filter-bar" role="group" aria-label={siteText("pages.filter-stories.39cead", "Filter stories")}>{categories.map(c => <button key={c} aria-pressed={filter === c} className={filter === c ? 'selected' : ''} onClick={() => setFilter(c)}>{c}</button>)}</div><div className="story-grid">{shown.map(item => <StoryCard key={item.id} item={item} />)}</div>{!shown.length && <p role="status">{siteText("pages.no-stories-in-this-category-yet-.ffb388", "No stories in this category yet.")}</p>}</section><Invitation /></>;
}
export function StoryDetailPage() {
  const siteText = useSiteCopy();
  const {
    slug
  } = useParams();
  const {
    content
  } = useContent();
  const item = content.stories.find(s => s.slug === slug);
  if (!item) return <NotFoundPage />;
  return <><section className="detail-heading article-heading container"><Link className="text-link" to="/stories">{siteText("pages.-stories-guides.a154be", "← Stories & guides")}</Link><span className="eyebrow">{item.category}{siteText("pages.-.d3dacf", " · ")}{item.readTime}</span><h1>{item.title}</h1><p>{item.summary}</p></section><div className="container detail-cover"><Photo src={item.image} eager /></div><article className="reading-column section-space"><Body text={item.body} /><div className="article-end"><Mark /><p>{siteText("pages.a-reflection-from.d7e571", "A reflection from ")}{content.settings.organisation}</p><ButtonLink to="/contact" kind="outline">{siteText("pages.continue-the-conversation.865b56", "Continue the conversation")}</ButtonLink></div></article><section className="container section-space"><SectionTitle eyebrow={siteText("pages.keep-exploring.44252f", "Keep exploring")} title={siteText("pages.another-perspective-.079fec", "Another perspective.")} /><div className="story-grid">{content.stories.filter(s => s.id !== item.id).slice(0, 3).map(s => <StoryCard item={s} key={s.id} />)}</div></section></>;
}
export function GetInvolvedPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  return <><PageHero page="get-involved" /><section className="container editorial-section section-space"><div><span className="eyebrow">{siteText("pages.start-with-what-you-can-offer.ef4bab", "Start with what you can offer")}</span><h2>{siteText("pages.time-skills-.813676", "Time. Skills.")}<br />{siteText("pages.a-willingness-to-help-.a643d4", "A willingness to help.")}</h2><ButtonLink to="/contact?topic=Volunteering">{siteText("pages.ask-about-volunteering.7cd4ae", "Ask about volunteering")}</ButtonLink></div><Body text={content.pages['get-involved'].body} /></section><section className="soft-section section-space"><div className="container"><SectionTitle eyebrow={siteText("pages.ways-to-contribute.9cac0f", "Ways to contribute")} title={siteText("pages.every-contribution-has-a-place-.c02dba", "Every contribution has a place.")} /><div className="three-paths">{[[siteText("pages.share-your-time.3b9804", "Share your time"), siteText("pages.ask-about-helping-with-community-gatherings-activities-.2fbb9f", "Ask about helping with community gatherings, activities and practical outreach.")], [siteText("pages.offer-your-skills.2af741", "Offer your skills"), siteText("pages.bring-your-experience-in-learning-creativity-organisati.ac8d72", "Bring your experience in learning, creativity, organisation or another area of community life.")], [siteText("pages.support-our-work.7fcc07", "Support our work"), siteText("pages.ask-the-team-how-a-donation-or-fundraising-activity-can.516b8a", "Ask the team how a donation or fundraising activity can help meet current needs.")]].map(([h, p], i) => <div key={h}><span className="path-number">{siteText("pages.0.b6589f", "0")}{i + 1}</span><h3>{h}</h3><p>{p}</p><Link className="text-link" to={`/contact?topic=${i === 2 ? 'Donations' : 'Volunteering'}`}>{siteText("pages.let-s-talk.48cd9f", "Let's talk")}<ArrowRight size={17} /></Link></div>)}</div></div></section><section className="container section-space" id="donate"><DonationPanel /></section></>;
}
export function DonatePage() {
  const siteText = useSiteCopy();
  return <><section className="detail-heading container"><span className="eyebrow">{siteText("pages.generosity-in-action.73df3b", "Generosity in action")}</span><h1>{siteText("pages.give-a-little-.2748c1", "Give a little.")}<br /><em>{siteText("pages.help-something-grow-.7a743c", "Help something grow.")}</em></h1><p>{siteText("pages.support-a-community-rooted-in-care-connection-and-pract.f89e22", "Support a community rooted in care, connection and practical compassion.")}</p></section><section className="container section-space"><DonationPanel /></section></>;
}
export function ContactPage() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const s = content.settings;
  return <><PageHero page="contact" /><section className="container contact-layout section-space"><div><span className="eyebrow">{siteText("pages.we-would-love-to-hear-from-you.9e782f", "We would love to hear from you")}</span><h2>{siteText("pages.let-s-begin.459987", "Let's begin")}<br />{siteText("pages.with-hello-.964d17", "with hello.")}</h2><p>{content.pages.contact.body}</p><div className="contact-methods"><div><Mail /><span><small>{siteText("pages.email-the-team.56839c", "Email the team")}</small><a href={emailHref(s.email)}>{s.email}</a></span></div><div><Phone /><span><small>{siteText("pages.give-us-a-call.7d6198", "Give us a call")}</small><a href={telephoneHref(s.phone)}>{s.phone}</a></span></div><div><MapPin /><span><small>{siteText("pages.our-contact-address.d5e5d2", "Our contact address")}</small>{s.address}</span></div></div><a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noopener noreferrer">{siteText("pages.open-directions.f9b9da", "Open directions")}<ArrowUpRight size={18} /></a></div><div className="contact-form-card"><h2>{siteText("pages.send-us-a-message.da73f2", "Send us a message")}</h2><p>{siteText("pages.a-question-a-first-visit-an-idea-there-is-a-place-for-i.bd9110", "A question, a first visit, an idea. There is a place for it here.")}</p><EnquiryForm /></div></section></>;
}
export function DonationReturnPage() {
  const siteText = useSiteCopy();
  const [search] = useSearchParams();
  const [status, setStatus] = useState('checking'),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const session = search.get('session_id');
    if (!backendEnabled || !session) {
      setStatus('unverified');
      return;
    }
    apiRequest(`/donations/status?session_id=${encodeURIComponent(session)}`).then(data => {
      if (active) setStatus(['paid', 'pending', 'cancelled'].includes(data.status) ? data.status : 'unverified');
    }).catch(e => {
      if (active) {
        setStatus('unverified');
        setError(e.message);
      }
    });
    return () => {
      active = false;
    };
  }, [search]);
  return <section className="container return-page section-space"><Mark large /><span className="eyebrow">{siteText("pages.your-donation.0c5634", "Your donation")}</span><h1>{status === 'paid' ? 'Thank you for your generosity.' : status === 'checking' ? 'Checking your donation…' : status === 'cancelled' ? 'Your donation was cancelled.' : status === 'pending' ? 'Your payment is still processing.' : 'We cannot confirm a payment here.'}</h1><p>{status === 'paid' ? 'The payment service has confirmed your donation.' : error || 'Please contact the team if you need help checking a donation. This page does not confirm a payment without verification.'}</p><ButtonLink to="/contact?topic=Donations">{siteText("pages.contact-the-team.78dadf", "Contact the team")}</ButtonLink></section>;
}
export function NotFoundPage() {
  const siteText = useSiteCopy();
  return <section className="container not-found section-space"><span className="eyebrow">{siteText("pages.404-page-not-found.e4ebc3", "404 · Page not found")}</span><h1>{siteText("pages.let-s-find.a3afce", "Let's find")}<br />{siteText("pages.a-different-path-.37b86a", "a different path.")}</h1><p>{siteText("pages.the-page-you-are-looking-for-is-not-available-.ea3513", "The page you are looking for is not available.")}</p><ButtonLink to="/">{siteText("pages.return-home.a3d070", "Return home")}</ButtonLink></section>;
}
