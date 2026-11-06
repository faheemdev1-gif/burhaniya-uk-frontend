import { useSiteCopy } from "./SiteCopy";
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useContent } from './ContentContext';
import { ButtonLink, Photo } from './components';
import { heroSlides, nextSlide, rotationAllowed } from './carousel';
export default function HeroSlider() {
  const siteText = useSiteCopy();
  const {
    content
  } = useContent();
  const slides = heroSlides(content);
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState<'auto' | 'playing' | 'paused'>('auto');
  const [actionHovered, setActionHovered] = useState(false);
  const [hidden, setHidden] = useState(document.hidden),
    [announcement, setAnnouncement] = useState('');
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touch = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const active = index % slides.length;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches),
      visibility = () => setHidden(document.hidden);
    media.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', change);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (!rotationAllowed(mode, hidden, reduced, actionHovered, slides.length)) return;
    const timer = window.setInterval(() => setIndex(i => nextSlide(i, 1, slides.length)), 5000);
    return () => clearInterval(timer);
  }, [mode, hidden, reduced, actionHovered, slides.length, index]);
  function choose(value: number) {
    const selected = nextSlide(value, 0, slides.length);
    setIndex(selected);
    setMode('paused');
    setActionHovered(false);
    setAnnouncement(`Slide ${selected + 1} of ${slides.length}: ${slides[selected].title} ${slides[selected].accent}`);
  }
  const playing = rotationAllowed(mode, false, reduced, false, slides.length);
  return <section className="community-slider" aria-roledescription="carousel" aria-label={siteText("HeroSlider.welcome-to-our-community.b21c0a", "Welcome to our community")} onFocusCapture={e => {
    const target = e.target as HTMLElement;
    // Keyboard users may read or use a slide without it changing underneath them.
    // Play is an explicit request to resume, even while its button retains focus.
    if (target.matches(':focus-visible') && !target.closest('.slider-pause')) setMode('paused');
  }} onKeyDown={e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      choose(active + (e.key === 'ArrowRight' ? 1 : -1));
    }
  }} onTouchStart={e => {
    touch.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }} onTouchEnd={e => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x,
      dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) choose(active + (dx < 0 ? 1 : -1));
  }}>
    <div className="slider-stage" aria-live="off">
      {slides.map((slide, i) => {
        const Heading = i === active ? 'h1' : 'h2';
        return <div key={slide.id} className={`hero-slide ${i === active ? 'is-active' : ''}`} aria-hidden={i !== active} inert={i !== active} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
          <Photo src={slide.image} eager className="slide-photo" />
          <div className="slide-shade" />
          <div className="container slide-content"><div className="hero-copy">
            <span className="eyebrow light">{slide.eyebrow}</span>
            <Heading>{slide.title}<br /><em>{slide.accent}</em></Heading>
            <p>{slide.intro}</p>
            <div className="hero-actions" onMouseEnter={() => setActionHovered(true)} onMouseLeave={() => setActionHovered(false)}><ButtonLink to="/contact?topic=First%20visit" kind="cream">{siteText("HeroSlider.plan-your-first-visit.dbf9b9", "Plan your first visit")}</ButtonLink><Link className="hero-text-link" to={slide.link}>{slide.linkLabel}<ArrowUpRight size={20} /></Link></div>
          </div></div>
        </div>;
      })}
      {slides.length > 1 && <div className="slider-image-controls"><button type="button" className="slider-arrow" aria-label={siteText("HeroSlider.previous-slide.8e5351", "Previous slide")} onClick={() => choose(active - 1)}><ArrowLeft size={23} /></button><button type="button" className="slider-arrow" aria-label={siteText("HeroSlider.next-slide.a4cf97", "Next slide")} onClick={() => choose(active + 1)}><ArrowRight size={23} /></button></div>}
    </div>
    <div className="slider-bar"><div className="container slider-bar-inner">
      <div className="slider-caption"><span className="live-dot" />{siteText("HeroSlider.different-backgrounds-one-welcoming-community-.3d18ae", "Different backgrounds. One welcoming community.")}</div>
      <div className="slider-controls">
        <div className="slider-dots">{slides.map((s, i) => <button key={s.id} type="button" className={i === active ? 'active' : ''} aria-label={`Show slide ${i + 1}: ${s.title}`} aria-current={i === active ? 'true' : undefined} onClick={() => choose(i)}><span /></button>)}</div>
        <span className="slider-counter" aria-hidden="true">{String(active + 1).padStart(2, '0')}{siteText("HeroSlider.-.0d0c4d", " / ")}{String(slides.length).padStart(2, '0')}</span>
        
        {slides.length > 1 && <><span className="slider-status" role="status">{!playing ? 'Paused' : actionHovered ? 'Reading link' : 'Auto · 5 sec'}</span><button type="button" className="slider-arrow slider-pause" aria-label={playing ? 'Pause automatic slides' : 'Start automatic slides'} onClick={() => {
              setActionHovered(false);
              setMode(playing ? 'paused' : 'playing');
            }}>{playing ? <Pause size={17} /> : <Play size={17} />}<span>{playing ? 'Pause' : 'Play'}</span></button></>}

      </div>
    </div></div><p className="sr-only" aria-live="polite">{announcement}</p>
  </section>;
}
