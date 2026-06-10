import { useEffect, useRef } from 'react';
import { config } from './data/site.js';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { useScrollAnimations } from './hooks/useScrollAnimations.js';

import Nav from './components/Nav.jsx';
import Cursor from './components/Cursor.jsx';
import NeonThread from './components/NeonThread.jsx';
import Hero from './components/Hero.jsx';
import Intro from './components/Intro.jsx';
import Projects from './components/Projects.jsx';
import Spotlights from './components/Spotlights.jsx';
import ArchiveGrid from './components/ArchiveGrid.jsx';
import Contact from './components/Contact.jsx';

export default function App() {
  const mainRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useSmoothScroll(reduced);
  useScrollAnimations(mainRef, reduced);

  // Smooth in-page anchor navigation (nav links, hero buttons).
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      e.preventDefault();
      if (href === '#') return; // placeholder links do nothing (yet)

      const el = document.querySelector(href);
      if (!el) return;
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reduced]);

  return (
    <>
      {config.customCursor && !reduced && <Cursor />}
      <Nav />
      <div className="grain" aria-hidden="true" />

      <main ref={mainRef} className="page">
        {/* The thread lives behind the content layer and spans the full page. */}
        <NeonThread reduced={reduced} />

        <div className="page-content">
          <Hero reduced={reduced} />
          <Intro />
          <Projects reduced={reduced} />
          <Spotlights />
          <ArchiveGrid />
          <Contact />
        </div>
      </main>
    </>
  );
}
