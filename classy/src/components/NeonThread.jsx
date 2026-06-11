import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { catmullRomPath } from '../lib/path.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * ─── NeonThread (the gilt thread) ────────────────────────────────────────────
 * The page's signature element: a hairline of gold — Ariadne's thread — that
 * draws itself as you scroll, weaving left and right through the layout and
 * coming to rest at the seal in the contact section.
 *
 * How it works
 *  1. Sections place invisible waypoint markers: <i className="wp" data-thread />
 *     positioned with inline left/top percentages. Move those markers to
 *     reshape the line — no code changes needed.
 *  2. On mount / load / resize, this component measures every marker, sorts
 *     them top-to-bottom, and threads a Catmull-Rom curve through them.
 *  3. A single scrubbed ScrollTrigger animates stroke-dashoffset (the draw),
 *     moves the glowing comet head along the path, and lights the end dot.
 *
 * Layering: the wrapper sits at z-index 1 inside <main>, while page content
 * sits at z-index 2 — so the line passes *behind* opaque panels and cards,
 * and shows through the negative space between them.
 */
export default function NeonThread({ reduced }) {
  const wrapRef = useRef(null);
  const pathRefs = useRef([]); // [halo, glow, core]
  const headRef = useRef(null);
  const [geom, setGeom] = useState({ d: '', w: 0, h: 0 });

  // ── Measure waypoints and build the path ─────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const build = () => {
      const main = wrap.parentElement; // <main class="page">
      if (!main) return;
      const mainRect = main.getBoundingClientRect();
      const w = Math.round(mainRect.width);
      const h = Math.round(main.scrollHeight);
      if (w === 0 || h === 0) return;

      const markers = Array.from(main.querySelectorAll('[data-thread]'));
      if (markers.length < 2) return;

      const pts = markers
        .map((m) => {
          const r = m.getBoundingClientRect();
          return {
            x: Math.min(Math.max(r.left + r.width / 2 - mainRect.left, 24), w - 24),
            y: r.top + r.height / 2 - mainRect.top,
          };
        })
        .sort((a, b) => a.y - b.y);

      const d = catmullRomPath(pts, 1);
      // Functional update + compare: identical geometry → no re-render.
      setGeom((prev) =>
        prev.d === d && prev.w === w && prev.h === h ? prev : { d, w, h }
      );
    };

    // First paint, then again once fonts/images have settled.
    const raf = requestAnimationFrame(build);
    window.addEventListener('load', build);

    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 180);
    });
    ro.observe(document.documentElement);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      window.removeEventListener('load', build);
      ro.disconnect();
    };
  }, []);

  // ── Drive the draw + comet head from scroll ──────────────────────────────
  useLayoutEffect(() => {
    if (!geom.d) return undefined;

    const wrap = wrapRef.current;
    const core = pathRefs.current[2];
    const head = headRef.current;
    if (!wrap || !core || !head) return undefined;

    const len = core.getTotalLength();
    const paths = pathRefs.current.filter(Boolean);
    const endDot = document.getElementById('thread-end');

    paths.forEach((p) => {
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = reduced ? '0' : `${len}`;
    });

    if (reduced) {
      head.style.opacity = '0';
      endDot && endDot.classList.add('lit');
      return undefined;
    }

    const setHead = (progress) => {
      const p = Math.min(Math.max(progress, 0), 1);
      const pt = core.getPointAtLength(len * p);
      head.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      head.style.opacity = p > 0.004 && p < 0.992 ? '1' : '0';
    };

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      onUpdate: (self) => {
        const offset = len * (1 - self.progress);
        paths.forEach((p) => {
          p.style.strokeDashoffset = `${offset}`;
        });
        setHead(self.progress);
        if (endDot) endDot.classList.toggle('lit', self.progress > 0.96);
      },
    });

    setHead(0);
    ScrollTrigger.refresh();

    return () => st.kill();
  }, [geom, reduced]);

  return (
    <div ref={wrapRef} className="thread" aria-hidden="true">
      {geom.d && (
        <svg
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          style={{ overflow: 'visible' }}
        >
          {/* Three layered strokes = cheap, filter-free glow */}
          <path
            ref={(el) => (pathRefs.current[0] = el)}
            className="thread-halo"
            d={geom.d}
          />
          <path
            ref={(el) => (pathRefs.current[1] = el)}
            className="thread-glow"
            d={geom.d}
          />
          <path
            ref={(el) => (pathRefs.current[2] = el)}
            className="thread-core"
            d={geom.d}
          />
          {/* A small gilded bead riding the tip of the thread */}
          <g ref={headRef} className="thread-head" style={{ opacity: 0 }}>
            <circle r="9" className="thread-head-glow" />
            <circle r="2.2" className="thread-head-core" />
          </g>
        </svg>
      )}
    </div>
  );
}
