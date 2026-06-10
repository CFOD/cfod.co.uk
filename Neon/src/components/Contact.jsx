import { contact, config } from '../data/site.js';

/**
 * The end of the page — and of the thread. The line resolves into the
 * terminal dot, which lights up (CSS .lit) when the draw completes.
 */
export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <header className="sec-head">
          <p className="mono" data-reveal>
            Contact
          </p>
          <span className="rule" aria-hidden="true" />
        </header>

        <a className="contact-mail" href={`mailto:${contact.email}`} data-reveal>
          {contact.email}
        </a>

        <ul className="contact-links mono" data-reveal data-reveal-delay="0.1">
          {contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="terminal" aria-hidden="true">
          <span id="thread-end" className="end-dot" />
          {/* The thread's final waypoint — dead centre of the terminal. */}
          <i className="wp" data-thread style={{ left: '50%', top: '50%' }} />
        </div>

        <footer className="footer mono">
          <span>
            © {new Date().getFullYear()} {config.name}
          </span>
          <span>{contact.smallprint}</span>
        </footer>
      </div>
    </section>
  );
}
