import { archive } from '../data/site.js';

/**
 * The personal / archive grid: small square cells for notes, fields,
 * experiments, and builds. Edit the list in src/data/site.js — the last
 * "Slot" item is an intentional empty space inviting future content.
 */
export default function ArchiveGrid() {
  return (
    <section id="archive" className="archive">
      <div className="container">
        <header className="sec-head">
          <p className="mono" data-reveal>
            Archive
          </p>
          <span className="rule" aria-hidden="true" />
        </header>

        <div className="archive-grid">
          {archive.map((cell, i) => (
            <a
              key={cell.ref + i}
              className={`cell ${cell.kind === 'Slot' ? 'slot' : ''}`}
              href="#"
              data-reveal
              data-reveal-delay={`${(i % 5) * 0.05}`}
              data-cursor
            >
              <span className="cell-kind mono">{cell.kind}</span>
              <span className="cell-ref mono">{cell.ref}</span>
            </a>
          ))}
        </div>
      </div>

      <i className="wp" data-thread style={{ left: '50%', top: '30%' }} />
    </section>
  );
}
