import { intro } from '../data/site.js';

/**
 * Sparse transition zone between the hero and the work. One oversized index,
 * one statement — and the neon thread bends through the negative space.
 */
export default function Intro() {
  return (
    <section id="intro" className="intro">
      <div className="container">
        <p className="mono intro-index" data-reveal>
          {intro.index}
        </p>
        <p className="intro-statement" data-reveal data-reveal-delay="0.1">
          {intro.statement}
        </p>
      </div>

      <i className="wp" data-thread style={{ left: '76%', top: '46%' }} />
    </section>
  );
}
