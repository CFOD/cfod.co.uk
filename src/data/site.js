/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE DATA — this is the file you edit.
 *
 *  Everything rendered on the page (names, labels, projects, links) comes from
 *  here. Components read this file; you should rarely need to touch them.
 *
 *  Media: drop images/video into /public/media and set `media: '/media/x.jpg'`
 *  on a project. Leave `media: null` to keep the placeholder panel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const config = {
  // Shown in the nav brand and the hero title.
  name: 'Your Name',

  // Small monospace line above the hero title.
  eyebrow: 'Portfolio — 2026',

  // Hero title, one array item per line. The last line renders outlined.
  title: ['Your', 'Name'],

  // The single line under the hero title. Keep it short.
  tagline: 'Selected work, systems, notes, and experiments.',

  // Custom cursor (desktop, fine pointers only). Set false to disable.
  customCursor: true,
};

// Navigation — label + anchor. Anchors map to section ids in the components.
export const nav = [
  { label: 'Work', href: '#work' },
  { label: 'Spotlight', href: '#spotlight-01' },
  { label: 'Archive', href: '#archive' },
  { label: 'Contact', href: '#contact' },
];

// One short statement for the transition section. Replace with your own line.
export const intro = {
  index: '001',
  statement:
    'A space being assembled — projects, prototypes, and field notes will live here.',
};

// ── Projects ────────────────────────────────────────────────────────────────
// Placeholder zones. For each future project, replace title / descriptor /
// tags, point `href` somewhere real, and optionally add `media`.
export const projects = [
  {
    id: 'project-01',
    index: '01',
    title: 'Project 01',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#', // ← link to case study / repo / video
    media: null, // ← '/media/project-01.jpg' once you have an image
  },
  {
    id: 'project-02',
    index: '02',
    title: 'Project 02',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
  {
    id: 'project-03',
    index: '03',
    title: 'Project 03',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
  {
    id: 'project-04',
    index: '04',
    title: 'Project 04',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
];

// ── Spotlights ──────────────────────────────────────────────────────────────
// Two cinematic, mostly-empty stages reserved for future major projects.
export const spotlights = [
  {
    id: 'spotlight-01',
    index: 'S–01',
    title: 'Spotlight',
    note: 'Reserved — future major project.',
  },
  {
    id: 'spotlight-02',
    index: 'S–02',
    title: 'Spotlight',
    note: 'Reserved — future major project.',
  },
];

// ── Archive grid ────────────────────────────────────────────────────────────
// Small modular cells. `kind` is the label, `ref` is the corner mark.
export const archive = [
  { kind: 'Note', ref: 'A–01' },
  { kind: 'Field', ref: 'A–02' },
  { kind: 'Experiment', ref: 'A–03' },
  { kind: 'Archive', ref: 'A–04' },
  { kind: 'Build', ref: 'A–05' },
  { kind: 'Note', ref: 'A–06' },
  { kind: 'Experiment', ref: 'A–07' },
  { kind: 'Field', ref: 'A–08' },
  { kind: 'Build', ref: 'A–09' },
  { kind: 'Slot', ref: '+' }, // empty slot — duplicate this row to grow the grid
];

// ── Contact ─────────────────────────────────────────────────────────────────
export const contact = {
  email: 'hello@yourdomain.com',
  links: [
    { label: 'GitHub', href: '#' },
    { label: 'X / Twitter', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
  smallprint: 'Shell v1 — content arriving.',
};
