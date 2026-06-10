import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * One place for all scroll-driven animation, wired by data attributes:
 *
 *   data-reveal          fade + rise into view (once)
 *   data-reveal-delay    optional stagger offset in seconds
 *   data-mask            clip-path wipe, left → right (once)
 *   data-parallax="0.2"  scrubbed vertical drift; sign flips direction
 *
 * Reduced motion: everything is simply set visible, no movement.
 */
export function useScrollAnimations(scopeRef, reduced) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;

    const ctx = gsap.context(() => {
      const reveals = gsap.utils.toArray('[data-reveal]');
      const masks = gsap.utils.toArray('[data-mask]');
      const parallaxEls = gsap.utils.toArray('[data-parallax]');

      if (reduced) {
        gsap.set(reveals, { opacity: 1, y: 0 });
        gsap.set(masks, { clipPath: 'inset(0% 0% 0% 0%)' });
        return;
      }

      reveals.forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || '0');
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              once: true,
            },
          }
        );
      });

      masks.forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.15,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 82%',
              once: true,
            },
          }
        );
      });

      parallaxEls.forEach((el) => {
        const v = parseFloat(el.dataset.parallax || '0.15');
        const section = el.closest('section') || el.parentElement;
        gsap.fromTo(
          el,
          { yPercent: -v * 100 },
          {
            yPercent: v * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    }, scope);

    return () => ctx.revert();
  }, [scopeRef, reduced]);
}
