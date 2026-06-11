import { spotlights } from '../data/site.js';

/**
 * Two tall, cinematic stages reserved for future flagship projects.
 * Three frames drift at different parallax speeds; an outlined index number
 * sits behind them for depth. The second stage mirrors the first (`alt`),
 * and the thread dips behind its central panel.
 */
function Spotlight({ spot, alt }) {
  return (
    <section id={spot.id} className={`spot ${alt ? 'alt' : ''}`}>
      <p className="big-index" aria-hidden="true">
        {spot.index}
      </p>

      <div className="spot-stage" aria-hidden="true">
        <span className="frame f1" data-parallax="-0.12" />
        <span className="frame f2" data-parallax="0.18" />
        <span className="frame f3" data-parallax="-0.07">
          <span className="mono">[ reserved ]</span>
        </span>
      </div>

      <div className="container spot-meta">
        <h3 className="spot-title" data-reveal>
          {spot.title}
        </h3>
        <p className="spot-note mono" data-reveal data-reveal-delay="0.08">
          {spot.note}
        </p>
      </div>

      <i
        className="wp"
        data-thread
        style={alt ? { left: '70%', top: '45%' } : { left: '30%', top: '45%' }}
      />
    </section>
  );
}

export default function Spotlights() {
  return (
    <>
      {spotlights.map((s, i) => (
        <Spotlight key={s.id} spot={s} alt={i % 2 === 1} />
      ))}
    </>
  );
}
