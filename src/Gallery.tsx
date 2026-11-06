import { useSiteCopy } from "./SiteCopy";
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useContent } from './ContentContext';
import { Photo, PageHero, SectionTitle, ButtonLink } from './components';
export default function Gallery() {
  const siteText = useSiteCopy();
  const {
      content
    } = useContent(),
    {
      slug
    } = useParams();
  const albums = content.galleries || [],
    album = albums.find(a => a.slug === slug);
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pictures = (album?.mediaIds || []).map(id => content.media.find(m => m.id === id)).filter(Boolean) as typeof content.media;
  useEffect(() => {
    if (selected !== null) {
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [selected]);
  return <>{!slug ? <><PageHero page="gallery" /><section className="container section-space"><div className="gallery-albums">{albums.map(a => <Link to={'/gallery/' + a.slug} key={a.id}><Photo src={content.media.find(m => m.id === a.mediaIds[0])?.url || content.home.heroImage} /><h2>{a.title}</h2><p>{a.description}</p><span className="text-link">{siteText("Gallery.view-album.0387fe", "View album ")}<ArrowRight size={18} /></span></Link>)}</div>{!albums.length && <p>{siteText("Gallery.community-photographs-will-be-shared-here-as-albums-are.a6011c", "Community photographs will be shared here as albums are published.")}</p>}</section></> : <section className="container section-space"><Link className="text-link" to="/gallery">{siteText("Gallery.-all-albums.22d7f6", "← All albums")}</Link>{album ? <><SectionTitle eyebrow={siteText("Gallery.community-moments.a473ea", "Community moments")} title={album.title}>{album.description}</SectionTitle><div className="photo-grid">{pictures.map((m, i) => <button key={m.id} onClick={() => setSelected(i)} aria-label={'Open photograph: ' + m.alt}><Photo src={m.url} /><span>{m.alt}</span></button>)}</div><dialog ref={dialog} className="gallery-lightbox" onCancel={() => setSelected(null)} onClick={e => {
          if (e.target === dialog.current) setSelected(null);
        }} onKeyDown={e => {
          if (e.key === 'ArrowRight') setSelected(i => i === null ? 0 : (i + 1) % pictures.length);
          if (e.key === 'ArrowLeft') setSelected(i => i === null ? 0 : (i - 1 + pictures.length) % pictures.length);
        }}><button className="lightbox-close" aria-label={siteText("Gallery.close-photograph.20aa71", "Close photograph")} onClick={() => setSelected(null)}><X /></button>{selected !== null && pictures[selected] && <><img src={pictures[selected].url} alt={pictures[selected].alt} /><p>{pictures[selected].alt}</p><div><button aria-label={siteText("Gallery.previous-photograph.1db1ac", "Previous photograph")} onClick={() => setSelected(i => (i! - 1 + pictures.length) % pictures.length)}><ArrowLeft /></button><span>{selected + 1}{siteText("Gallery.-.0d0c4d", " / ")}{pictures.length}</span><button aria-label={siteText("Gallery.next-photograph.8aee97", "Next photograph")} onClick={() => setSelected(i => (i! + 1) % pictures.length)}><ArrowRight /></button></div></>}</dialog></> : <><h1>{siteText("Gallery.album-not-found.fe1def", "Album not found")}</h1><ButtonLink to="/gallery">{siteText("Gallery.browse-the-gallery.7c0b19", "Browse the gallery")}</ButtonLink></>}</section>}</>;
}
