import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { config } from '../data/site.js';
import { webglAvailable } from '../lib/webgl.js';

// three.js loads as its own chunk only when the hero actually renders it.
const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'));

/**
 * Full-viewport hero. The particle field renders behind the type; an
 * IntersectionObserver pauses the render loop once the hero scrolls away.
 * No WebGL (or reduced motion) → a quiet static gradient stands in.
 */
export default function Hero({ reduced }) {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(true);
  const [canWebGL] = useState(() => webglAvailable());

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const showCanvas = canWebGL && !reduced;

  return (
    <section id="top" ref={sectionRef} className="hero">
      <div className="hero-bg" aria-hidden="true">
        {showCanvas ? (
          <Suspense fallback={<div className="hero-fallback" />}>
            <HeroCanvas active={active} />
          </Suspense>
        ) : (
          <div className="hero-fallback" />
        )}
        <div className="hero-shaft" />
        <div className="hero-vignette" />
      </div>

      <div className="container hero-inner">
        <p className="mono hero-eyebrow" data-reveal>
          {config.eyebrow}
        </p>

        <h1 className="hero-title" data-reveal data-reveal-delay="0.08">
          {config.title.map((line, i) => (
            <span key={line + i} className="hero-line">
              {i === config.title.length - 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h1>

        <p className="hero-tagline" data-reveal data-reveal-delay="0.18">
          {config.tagline}
        </p>

        <div className="hero-actions" data-reveal data-reveal-delay="0.26">
          <a className="btn" href="#work">
            View work
          </a>
          <a className="btn ghost" href="#contact">
            Contact
          </a>
        </div>
      </div>

      <div className="hero-hint mono" aria-hidden="true">
        <span>Scroll</span>
        <span className="hint-line" />
      </div>

      {/* Neon thread waypoint — the line is born at the base of the hero. */}
      <i className="wp" data-thread style={{ left: '50%', bottom: '6%' }} />
    </section>
  );
}
