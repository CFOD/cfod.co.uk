import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertial smooth scrolling via Lenis, driven by GSAP's ticker so that
 * ScrollTrigger and the scroll position always agree on the same frame.
 * Lenis rides on native scroll, so window scroll listeners keep working.
 *
 * Disabled entirely when the user prefers reduced motion.
 */
export function useSmoothScroll(reduced) {
  useEffect(() => {
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    // Expose for the anchor-link handler in App.jsx.
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = undefined;
    };
  }, [reduced]);
}
