import { projects } from '../data/site.js';
import ProjectCard from './ProjectCard.jsx';

export default function Projects({ reduced }) {
  return (
    <section id="work" className="projects">
      <div className="container">
        <header className="sec-head">
          <p className="mono" data-reveal>
            Work
          </p>
          <span className="rule" aria-hidden="true" />
        </header>

        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} flip={i % 2 === 1} reduced={reduced} />
        ))}
      </div>
    </section>
  );
}
