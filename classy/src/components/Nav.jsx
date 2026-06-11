import { useEffect, useState } from 'react';
import { config, nav } from '../data/site.js';

/**
 * Fixed, minimal navigation. Transparent at the top; gains a blurred dark
 * backdrop + hairline once you scroll. Anchor clicks are smoothed globally
 * in App.jsx.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand" href="#top" data-cursor>
        <span className="brand-dot" aria-hidden="true" />
        <span className="brand-name">{config.name}</span>
      </a>

      <ul className="nav-links mono">
        {nav.map((item) => (
          <li key={item.href}>
            <a href={item.href} data-cursor>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
