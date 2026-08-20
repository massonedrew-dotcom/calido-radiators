# Multi-page restructure + taste-skill pass

Second pass over the site. Two things at once: the single page became six, and
the `design-taste-frontend` (v2) checklist was applied in redesign-preserve
mode.

---

## 1. Design read and dials

Per the skill's Section 0.B, declared before any code:

> Redesign-preserve of a manufacturer's marketing site for B2B specifiers and
> consumers, with an industrial thermal language, leaning on the existing token
> system derived from the logo, plus GSAP scrolltelling, technical line-work and annotated product photography.

**Mode (11.A):** Redesign - Preserve. The IA change was explicitly requested, so
11.C's "do not change information architecture unless asked" is satisfied.
**Dials (1.A):** preserve → match existing. `DESIGN_VARIANCE 7 / MOTION 7 / DENSITY 4`.
**System (2):** no official design system applies. Tailwind v4 plus the project's
own tokens, honestly labelled as a custom system rather than dressed up as one.

---

## 2. The IA

| Route | Sections | Surface |
| --- | --- | --- |
| `/` | hero, benefits, overview, start | molten → cooling (dark) |
| `/about` | about, capacity, quality, warranty | cooling → cinder (dark) |
| `/technology` | technology, anatomy, heat | cinder → deep (dark) |
| `/models` | range, scale, colors | light → lightWarm (light) |
| `/installation` | systems, connection | lightWarm → light (light) |
| `/contact` | contact | close (dark) |

Twelve routes with `/en/*` mirroring. Slugs are identical across locales so the
language switch is a prefix swap and lands on the same page rather than dumping
the reader back at the root.

**Everything is derived from one table** (`lib/pages.ts`): the routes, the nav,
the footer sitemap, the `sitemap.xml`, the section order, each page's ink
polarity, and the backdrop stack. Adding a page is one entry, not eight edits.

---

## 3. Page Theme Lock, and why the split actually fixed the design

The skill's §4.11 forbids a page inverting between light and dark mid-scroll.
The single-page build did it twice. That was not a technicality: the old
`ToneSeam` component existed *only* to disguise those two inversions with an
organic wave, and it was disguising a problem rather than solving one.

Splitting the site let the temperature arc move up a level. Each page now holds
one polarity and travels between two neighbouring surfaces of the same family;
the full melt-to-cold-to-lit journey happens as you walk the nav. `ToneSeam` is
retired, and there are no seams to hide because there are no flips.

It also made the contrast problem fixable, though not for the reason first
assumed. axe resolves a background by walking up the DOM, and the thermal stack
is `position: fixed`, so it is nobody's ancestor: on the single-page build axe
fell through to `html` and reported 40 failures that did not exist.

The first attempt to call this solved was wrong, and the error is worth
recording: the "zero failures" reading came from a run where `npx serve -s` was
rewriting every path to `index.html`, so the light page under test was actually
serving the dark home page. Re-measured against a correctly served export, the
light pages still failed exactly as before.

The real fix is available only because each page now holds one polarity:
`<main>` carries an opaque base colour for its surface (`SURFACE_BASE`) and the
thermal stack renders **inside** main, fixed at z-0 within its stacking context.
Visually nothing changes - the stack still covers the viewport and still sits
behind the content - but axe now finds an opaque ancestor in the right colour
family. Verified on both a dark and a light page: **accessibility 100, zero
contrast failures**, against a server that is genuinely serving each route.

---

## 4. Checklist violations fixed

| Rule | Before | After |
| --- | --- | --- |
| Em-dash ban (§9.G) | 20 in copy, 3 rendered as contact values, 2 in OG alt, 2 in image alt | **0** in the production HTML of all 12 routes |
| Eyebrow restraint (§4.7) | 14 against a limit of 5 | 1 per page, every page at or under `ceil(sections/3)` |
| Hero stack (§4.7) | 6 text elements | 4: brand strip, headline, subtext, CTAs |
| Zigzag cap (§4.7) | 3 consecutive image+text splits | resolved by the split; no page has 3 in a row |
| Section-layout repetition | one page, many repeats | 2-4 layout families per page, none repeated |
| Duplicate CTA intent (§4.5) | header, hero, floating button, section CTAs | one label (`nav.cta`) everywhere |

Specifics worth noting:

- The three contact rows rendered a literal `—` as their value, which was both
  a Tell and a blank field pretending to be data. They now read
  "уточняется" / "to be confirmed", which is what is actually true.
- Two `<legend>` elements were using `.kicker`. They are form labels, not
  section eyebrows, but they matched the mechanical `uppercase tracking` count,
  so they were restyled to a plain bold label.
- The hero's "Узбекистан · с 2015 года" eyebrow moved out. That fact is the
  subject of the about page, not a garnish above the wordmark.

---

## 5. Deliberate deviations from the skill

**Icons stay hand-rolled.** §3.C says never hand-roll SVG icons and to install
Phosphor or Tabler. The site uses eight simple glyphs (arrow, chevron, check,
close, chat). Adding an icon dependency to a build whose known weak point is
mobile LCP costs more than it returns. Flagged rather than silently ignored.

**Animation stays GSAP, not Motion.** §3.A defaults to `motion/react`, but §10
says GSAP for full-page scrolltelling and never to mix the two in one tree. The
site is scrolltelling with a WebGL hero backdrop on the same ticker, so GSAP is the
compliant choice here, not the lazy one.

**`.kicker` still appears outside section headings** (counter captions, the
contact summary, footer column labels). Those are not eyebrows sitting above a
headline and are outside the rule's scope.

---

## 6. Verification

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next build` static export | 19 routes, clean |
| Lighthouse desktop, `/` | Perf **97**, A11y **100**, BP 100, SEO 100, LCP 1.0s, TBT 90ms, CLS 0 |
| Lighthouse desktop, `/models` | Perf **99**, A11y **100**, BP 100, SEO 100, LCP 0.9s, TBT 10ms, CLS 0 |
| Lighthouse mobile, `/` | Perf 86 / 87 / 93 across three runs, CLS 0.016 |
| axe contrast failures | **0** on a dark page and a light page (was 40 unresolvable) |
| Em-dashes in exported HTML | **0** across all 12 routes |
| Page Theme Lock | PASS on every page, one polarity each |
| Clipped headings | none, at 1440 and 390 |
| Horizontal page scroll | none, at 1440 and 390 |
| Eyebrow count per page | within `ceil(sections/3)` on all six |

---

## 7. Follow-up round: legacy URLs and mobile performance

### 7.1 Responsive image variants

`images.unoptimized` was the previous answer to having no optimiser route on a
file host. That flag does more than disable resizing: it also switches off
srcset generation entirely, so every device downloaded the master and a phone
rendering the hero at ~340 CSS px was pulling the 900px file.

The ladder is now pre-rendered at build time (`scripts/prep-assets.mjs` emits
`@420` and `@640` beside each master) and `lib/imageLoader.ts` picks the rung.
Widths are recorded per asset in the manifest, because small sources like the
colourway swatches have no variants and requesting `@420` for a 312px file
would 404. `deviceSizes` and `imageSizes` are split so the same file cannot
appear twice in one srcset.

Hero on mobile: 66 kB → 27 kB. Page weight 388 → 348 kB. Mobile TBT 260-350ms →
160-210ms.

**Mobile Lighthouse, home:** 86, 87, 93 on three clean runs, median 87, CLS
0.016. Earlier rounds of 68 and similar outliers were Chrome starting cold on a
contended machine, not the page; they disappear once nothing else is running.
The ≥ 85 target is met.

### 7.2 Legacy `/#section` URLs

Before the split the whole site was addressable as `/#technology`,
`/#warranty` and so on. Those URLs are what the old nav emitted and what any
bookmark or inbound link still points at.

A blocking inline script in the root layout (`legacyHashRedirect` in
`app/_shared/root.tsx`) maps a hash to its page and replaces the URL before
React exists. The map is generated from the page registry, so a section that
moves pages cannot leave a stale redirect behind. `HashRouting` handles the
remaining job: scrolling to the section once fonts and images have settled,
because the browser's own hash jump fires before the layout has stopped moving.

Two implementations were discarded on the way, both of which shipped a blank
page:

1. **`router.replace` from a React effect.** The Next client router cannot
   fetch a route payload on a static export the way it can behind a server; it
   changed the URL and rendered an empty `<main>`.
2. **Scrolling from inside a `ScrollTrigger` `refresh` handler.** A refresh is
   part-way through recomputing every trigger's start and end, and moving the
   scroll position underneath it throws
   `Cannot read properties of undefined (reading 'end')`, which took the whole
   hydration with it. The scroll is now deferred two frames out of that stack.

### 7.3 What is NOT verified, and how to check it

The cross-page redirect could only be confirmed as far as "the URL changes to
the right page". The embedded preview pane used for verification cannot render
any document reached by **script-driven navigation to a URL containing a
hash** — reproduced with a bare `location.replace('/about/#warranty')` from an
unrelated settled page, with none of this code in the path. Direct navigation
to the same URL renders correctly, and `location.replace` to a hash-less URL
renders correctly.

To confirm in a real browser: open `/#warranty`, expect to land on
`/about/#warranty` with the warranty section in view.

A second harness trap worth recording: `npx serve -s out` was used at first.
The `-s` flag is single-page-app mode and rewrites **every** path to
`index.html`, so an early "all routes return 200" check was meaningless — every
route was serving the home page. Serve a multi-page export with plain
`npx serve out`. GitHub Pages resolves `/about/` to `/about/index.html`
natively, so production was never affected.
