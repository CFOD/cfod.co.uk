import { useRef } from 'react';
import { useTilt } from '../hooks/useTilt.js';

/**
 * One project zone. Media column + meta column, alternating sides (`flip`).
 * Hover: pointer-driven tilt, a cursor-following sheen, and accent corner
 * brackets. Reveal: the media panel wipes in via clip-path (data-mask).
 *
 * Replace the placeholder by setting `media` in src/data/site.js.
 */
export default function ProjectCard({ project, flip, reduced }) {
  const cardRef = useRef(null);
  useTilt(cardRef, { reduced });

  return (
    <article className={`proj ${flip ? 'flip' : ''}`} id={project.id}>
      <a
        className="proj-media"
        href={project.href}
        aria-label={`${project.title} — open`}
        data-mask
      >
        <div ref={cardRef} className="card" data-cursor>
          {project.media ? (
            <img src={project.media} alt={project.title} loading="lazy" />
          ) : (
            <div className="media-ph mono">[ plate ]</div>
          )}
          <span className="card-sheen" aria-hidden="true" />
          <span className="card-corners" aria-hidden="true" />
        </div>
      </a>

      <div className="proj-meta">
        <p className="proj-index" aria-hidden="true" data-reveal>
          {project.index}
        </p>
        <h3 className="proj-title" data-reveal data-reveal-delay="0.06">
          {project.title}
        </h3>
        <p className="proj-desc" data-reveal data-reveal-delay="0.12">
          {project.descriptor}
        </p>
        <ul className="tags mono" data-reveal data-reveal-delay="0.18">
          {project.tags.map((t, i) => (
            <li key={t + i}>{t}</li>
          ))}
        </ul>
        <a
          className="proj-link mono"
          href={project.href}
          data-reveal
          data-reveal-delay="0.24"
        >
          Open <span className="arrow">→</span>
        </a>
      </div>

      {/* Thread waypoint sits on the meta side, so the line weaves around the panel. */}
      <i
        className="wp"
        data-thread
        style={flip ? { left: '9%', top: '50%' } : { right: '9%', top: '50%' }}
      />
    </article>
  );
}
