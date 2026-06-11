# Gilt Thread — Portfolio Shell

A single-page React + Vite portfolio shell: dark, editorial, deliberately
sparse, with the air of an old reading room. Dust motes drift through a shaft
of light in the hero, and one hairline of gold — *Ariadne's thread* — draws
itself as you scroll, weaving left and right through every section before
coming to rest at a small gilded seal in the contact block. Type is set in
Cormorant Garamond and EB Garamond, with Cinzel's Roman inscriptional
capitals for the small labels.

All copy on the page is placeholder by design. You populate it later by
editing **one file**: `src/data/site.js`.

---

## Quick start

```bash
npm install
npm run dev        # local dev server (URL printed in terminal)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

Node 20.19+ (or 22+) is recommended for Vite.

---

## Stack — what each library does

| Library | Role |
| --- | --- |
| **React 19 + Vite** | App framework and build tool. Fast dev server, tiny config. |
| **three / @react-three/fiber** | The hero's drifting dust motes. R3F lets the scene live as a React component; three.js is code-split into its own chunk and only loads if WebGL is available. |
| **GSAP + ScrollTrigger** | All scroll choreography: section reveals, masked media wipes, parallax frames, and the thread's draw progress. |
| **Lenis** | Inertial smooth scrolling. It rides on native scroll, so ScrollTrigger and ordinary scroll listeners stay accurate. |

Styling is one hand-written CSS file (`src/styles/global.css`) — no framework,
so everything is greppable and editable.

---

## File structure

```
neon-thread-portfolio/
├── index.html                  # fonts, meta, progressive-enhancement flag
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                # entry
    ├── App.jsx                 # composition + smooth-scroll + anchor handling
    ├── data/
    │   └── site.js             # ★ ALL editable content lives here
    ├── styles/
    │   └── global.css          # ★ design tokens at the top (:root)
    ├── lib/
    │   ├── path.js             # Catmull-Rom → Bézier for the thread
    │   └── webgl.js            # WebGL availability check
    ├── hooks/
    │   ├── usePrefersReducedMotion.js
    │   ├── useSmoothScroll.js  # Lenis ↔ GSAP ticker sync
    │   ├── useScrollAnimations.js  # data-reveal / data-mask / data-parallax
    │   └── useTilt.js          # pointer tilt + sheen CSS variables
    └── components/
        ├── Nav.jsx
        ├── Cursor.jsx          # optional custom cursor
        ├── NeonThread.jsx      # ★ the gilt thread (scroll-drawn line)
        ├── Hero.jsx            # lazy-loads the canvas, owns the fallback
        ├── HeroCanvas.jsx      # dust motes in a light shaft + custom GLSL
        ├── Intro.jsx
        ├── Projects.jsx / ProjectCard.jsx
        ├── Spotlights.jsx
        ├── ArchiveGrid.jsx
        └── Contact.jsx
```

---

## Where to add your content

Everything below happens in **`src/data/site.js`** unless noted.

- **Name / hero / tagline** — `config`. The hero title is an array of lines;
  the last line renders outlined.
- **Navigation** — `nav`. Labels + `#anchor` hrefs.
- **Projects** — `projects`. Replace `title`, `descriptor`, `tags`, point
  `href` at a case study, and set `media: '/media/your-image.jpg'` once you
  have visuals (drop files into `/public/media/`). `media: null` keeps the
  hatched placeholder panel.
- **Spotlights** — `spotlights`. Two reserved cinematic stages for future
  flagship work.
- **Archive** — `archive`. Small cells; duplicate rows to grow the grid. The
  final `Slot` cell is an intentional empty space.
- **Contact** — `contact`. Email, social links, footer smallprint.

Inline `← comments` in `site.js` mark every spot.

---

## Theming

Open `src/styles/global.css` — the design tokens sit at the top in `:root`:

- **Accent colour**: change `--accent` *and* `--accent-rgb` (used for alpha
  washes). The default is antique gold (`#c8a45c`). The WebGL shader reads
  `--accent` at load, so the dust, thread, cursor, and hovers all re-theme
  together.
- **Fonts**: swap the Google Fonts `<link>` in `index.html`, then update
  `--font-display` (Cormorant Garamond), `--font-body` (EB Garamond), and
  `--font-label` (Cinzel — the engraved capitals used for labels/buttons).
- **Spacing / width**: `--pad` and `--max`.

---

## The gilt thread

`NeonThread.jsx` (the component keeps its original name) measures invisible
waypoint markers, threads a smooth Catmull-Rom curve through them, and ties
the line's `stroke-dashoffset` (plus a small gold bead at its tip) to scroll
progress with one scrubbed ScrollTrigger.

To reshape the route, move the markers — each section contains one:

```jsx
<i className="wp" data-thread style={{ left: '76%', top: '46%' }} />
```

Add, remove, or reposition markers freely; the curve rebuilds automatically
(also on resize). The line sits on a layer *behind* cards and panels, so it
weaves through negative space and ducks under content. The final marker in
`Contact.jsx` lands on the seal, which lights gold at ~96% scroll.

---

## Motion & accessibility

- `prefers-reduced-motion` disables smooth scrolling, tilt, the cursor, and
  the WebGL hero (static gradient instead); the thread renders fully drawn
  and reveals become instant.
- Reveal pre-hiding only applies when JS runs (`html.js` class), so content
  is never invisible without JavaScript.
- Keyboard focus is visible (`:focus-visible` accent outline).
- The custom cursor only mounts on hover-capable fine-pointer devices; turn
  it off entirely with `config.customCursor = false`.

## WebGL fallback & performance

- No WebGL → layered radial-gradient hero, automatically.
- The canvas pauses (`frameloop="never"`) whenever the hero is off-screen.
- Device pixel ratio is capped at 2; the thread's glow is layered strokes,
  not SVG filters, so scrolling stays cheap.

## Deploying

`npm run build` emits a static `dist/` folder (relative paths, thanks to
`base: './'`). Drop it on Netlify, Vercel, GitHub Pages, Cloudflare Pages, or
any static host — no server required.
