/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE DATA — this is the file you edit.
 *
 *  Everything rendered on the page (names, labels, projects, links) comes from
 *  here. Components read this file; you should rarely need to touch them.
 *
 *  Media: drop images/video into /public/media and set `media: '/media/x.jpg'`
 *  on a project. Leave `media: null` to keep the placeholder plate.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const config = {
  // Shown in the nav brand and the hero title.
  name: 'CFOD',

  // Small inscription line above the hero title.
  eyebrow: 'Portfolio · MMXXVI',

  // Hero title, one array item per line. The last line renders in gilded italic.
  title: ['CFOD', ''],

  // The single line under the hero title. Keep it short.
  tagline: 'Essays, arguments, systems, and marginalia.',

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
  index: '§ I',
  statement:
    'A study being assembled — essays, projects, and field notes will take their places here.',
};

// ── Projects ────────────────────────────────────────────────────────────────
// Placeholder zones. For each future project, replace title / descriptor /
// tags, point `href` somewhere real, and optionally add `media`.
export const projects = [
  {
    id: 'project-01',
    index: 'I',
    title: 'Project One',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#', // ← link to essay / case study / repo
    media: null, // ← '/media/project-01.jpg' once you have an image
  },
  {
    id: 'project-02',
    index: 'II',
    title: 'Project Two',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
  {
    id: 'project-03',
    index: 'III',
    title: 'Project Three',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
  {
    id: 'project-04',
    index: 'IV',
    title: 'Project Four',
    descriptor: 'Short descriptor',
    tags: ['Tag', 'Tag', 'Tag'],
    href: '#',
    media: null,
  },
];

// ── Spotlights ──────────────────────────────────────────────────────────────
// Two cinematic, mostly-empty stages reserved for future major works.
// The index renders as a huge ghost letter behind the stage (Α, Β — alpha, beta).
export const spotlights = [
  {
    id: 'spotlight-01',
    index: 'Α',
    title: 'Spotlight',
    note: 'Reserved — future major work.',
  },
  {
    id: 'spotlight-02',
    index: 'Β',
    title: 'Spotlight',
    note: 'Reserved — future major work.',
  },
];

// ── Archive grid ────────────────────────────────────────────────────────────
// Small modular cells. `kind` is the label, `ref` is the folio mark.
export const archive = [
  { kind: 'Essay', ref: 'fol. i' },
  { kind: 'Note', ref: 'fol. ii' },
  { kind: 'Fragment', ref: 'fol. iii' },
  { kind: 'Commentary', ref: 'fol. iv' },
  { kind: 'Build', ref: 'fol. v' },
  { kind: 'Marginalia', ref: 'fol. vi' },
  { kind: 'Letter', ref: 'fol. vii' },
  { kind: 'Argument', ref: 'fol. viii' },
  { kind: 'Translation', ref: 'fol. ix' },
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
  smallprint: 'Vol. I · in preparation.',
};
