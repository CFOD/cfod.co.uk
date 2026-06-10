import { useEffect } from 'react';

/**
 * Premium card tilt: writes --rx / --ry (rotation, deg) and --mx / --my
 * (pointer position, %) onto the element as CSS variables. The stylesheet
 * turns those into a perspective transform and a cursor-following sheen.
 *
 * Only active on devices with hover + a fine pointer, and never when the
 * user prefers reduced motion.
 */
export function useTilt(ref, { max = 5.5, reduced = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height; // 0..1
      const ry = (px - 0.5) * 2 * max;
      const rx = -(py - 0.5) * 2 * max;
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    };

    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, max, reduced]);
}
