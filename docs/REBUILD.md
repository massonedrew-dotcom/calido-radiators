# Rebuild — what changed, and where the compromises are

Blocks A–J of the revision brief. Verified at 1440 × 900, 1920 × 1080,
768 × 1024 and 390 × 844.

---

## 1. Changed files

### New

| File | What it is |
| --- | --- |
| `styles/tokens.css` | The whole colour system. Brand anchors sampled from the logo artwork (indigo `#22337E`, red `#D91222`), two ramps, three neutrals, one heat terminus, and the surface-relative ink tokens with their `.on-dark` bindings. |
| `lib/thermal.ts` | The scroll temperature dramaturgy as one table: six layers, which section each takes over at, the text polarity while it is on top, and its crossfade length. `SURFACE` and `SEAM_AT` are derived from it, so copy colour and the colour behind it cannot disagree. |
| `components/layout/ThermalBackdrop.tsx` | The single continuous background. Six stacked fixed layers crossfaded on opacity by scroll position. |
| `components/layout/ToneSeam.tsx` | The organic front that carries a dark↔light polarity flip, so the two places the surface inverts are a shape rather than a line. |
| `components/layout/FloatingCta.tsx` | Persistent CTA — corner pill on desktop, sticky bar on mobile — opening a focus-trapped dialog. |
| `components/ui/RequestForm.tsx` | The enquiry form, shared by the contact section and the CTA dialog. |
| `components/sections/Scale.tsx` | Size comparison, promoted out of the model slider into its own section. |
| `components/sections/CastingDiagram.tsx` | The casting sequence as a scrubbed technical cross-section: hatched die halves with the cavity cut into them, metal rising under pressure, the finished section. |
| `docs/ASSETS.md` | Specification for the assets that still need producing outside the repo. |

### Removed

| File | Why |
| --- | --- |
| `components/ui/ArcField.tsx` | The decorative arcs the brief asked to delete — they ran off the frame and crossed content without logic. Removed from all six sections that used it. |
| `components/gl/Stage.tsx`, `components/gl/Slot.tsx`, `lib/gl/geometry.ts`, `lib/gl/anchors.ts` | The 3D product layer, ~1 200 lines. See "Retiring the 3D layer" below. |

### Substantially rewritten

`app/globals.css` · `components/layout/Section.tsx` · `components/layout/Header.tsx` ·
`components/layout/ProgressRail.tsx` · `components/layout/SmoothScroll.tsx` ·
`components/gl/GLLayer.tsx` · `lib/gl/shaders.ts` · `lib/gsap.ts` ·
`components/sections/Hero.tsx` · `Technology.tsx` · `Anatomy.tsx` · `Systems.tsx` ·
`Connection.tsx` · `ModelRange.tsx` · `Contact.tsx` · `Capacity.tsx` ·
`scripts/prep-assets.mjs` · `content/ru.ts` · `content/en.ts` · `content/index.ts`

### Touched

Every other section (token sweep, density), `components/ui/{Reveal, SplitHeading, DrawnCheck, DrawnFactory, DrawnFlow, HeatPlumes, ParallaxImage, ScrubWarm, SectionHeading, WaveButton, Leader}.tsx`,
`app/_shared/root.tsx` and both `opengraph-image.tsx` (theme colour and OG gradient onto the new palette),
all 27 files in `public/` (regenerated).

---

## 2. Bugs found while working, and what they actually were

These were not in the brief; the brief described their symptoms.

**"The content doesn't load until you scroll past it."**
Every ScrollTrigger start/end — and Lenis's own scroll limit — is computed from
the document height at creation time, which is before the webfont swaps and
before a single image decodes. Lenis was clamping the page at 13 101 px against
a real limit of 16 473, so the last two sections were literally unreachable, and
triggers were evaluating against offsets their elements never occupied. Fixed by
a settle pass in `SmoothScroll` that awaits fonts and images, then calls
`lenis.resize()` + `ScrollTrigger.refresh()`, with a debounced `ResizeObserver`
for anything later.

**Two document-level triggers died a fifth of the way from the bottom.**
`trigger: documentElement, end: 'bottom bottom'` resolves against the root
element's border box — 14 001 px here — not the scroll range, because pin
spacers and overflowing children do not count toward it. The thermal backdrop's
last layer could never arrive and the progress rail hit 100% early. Both now use
`start: 0, end: () => ScrollTrigger.maxScroll(window)`.

**Stage 01 of the casting sequence rendered nothing at all.**
"Empty die" was implemented as a pour level of zero, and a pour level of zero
`discard`s every fragment in the shader. The right-hand half of the section was
genuinely blank until a quarter of the way through it. Fixed by giving the die
its own `uPour`, then made moot: the whole scene is SVG now.

**Every dark section was painting ink `#0D1020` on indigo `#0D1338` — 1.04:1.**
Two separate causes, both cascade-level:
1. `:root` was unlayered while `.on-dark` sat in `@layer components`, and an
   unlayered declaration beats any layered one regardless of specificity.
2. Routing `--color-fg-strong: var(--fg-strong)` through `@theme` cannot work at
   all: a custom property's value is substituted on the element that *declares*
   it, so `--fg-strong` resolved at `:root` and the light value inherited
   everywhere. `.on-dark` now redeclares the theme names themselves.

**Anatomy leaders all converged on one point.** Averaging a part group's members
put the collector — two collars and two ports travelling to +132 and −132 on Y —
at exactly the origin. Each group now names one representative part
(`GROUP_ANCHOR`) and the explode vectors fan into four distinct directions.

**Toggling `will-change` per frame took mobile TBT from 230 ms to 6 780 ms.**
Tried as an optimisation on the six viewport-sized backdrop layers; it thrashes
layer creation on full-screen gradients. Reverted, and the reasoning is recorded
in the component so nobody tries it again.

---

## 3. Retiring the 3D layer

Three of the site's five WebGL scenes were rebuilt, shipped, and then deleted.
This is the account, because the reason is not "WebGL is bad" and the mistake is
worth not repeating.

**What was wrong.** Procedural geometry — boxes, cylinders and extrusions lit by
a hand-written three-point shader — was standing a few hundred pixels away from
studio product renders of the same object. Every scene lost that comparison, and
losing it did specific damage: the exploded view was advertising that it was not
the photograph next to it, and the die read as two grey slabs. The client's own
verdict on the rebuilt version was that the 3D looked worse than what it
replaced, and they were right.

**Why it survived so long.** The preview surface available during the first
build does not composite: `requestAnimationFrame` never fires,
`document.timeline.currentTime` stays at 0, and screenshots time out. Everything
was verified through a measurement harness that drove Lenis and
`gsap.ticker.tick()` by hand and read back geometry, contrast and trigger state.
That is reliable for "is the heading clipped" and "what is the contrast ratio",
and it is worth nothing at all for "does this look good" — so a scene could pass
every check and still be the worst thing on the page. Nothing was actually
*looked at* until real browser screenshots arrived.

**What replaced it.**

| Was | Is |
| --- | --- |
| `cast` scene — die and pour | `components/sections/CastingDiagram.tsx`, a scrubbed cross-section: hatched halves with the cavity cut into them, cores, guide bushes, a sprue under pressure |
| `anatomy` scene — exploded section | An annotated photograph in `Anatomy.tsx`, leaders landing on the real manifold port, fin blade, cast web and painted face |
| `model` scene — slider card | The studio still, full-bleed in the card (done earlier) |

Two things made the swap an improvement rather than a retreat. A cutaway can
show what no camera can — metal inside a closed steel die — so the drawing is
not a downgrade from a photograph, it is the only way to show that frame. And
the site already spoke engineering line-work in the connection diagrams on the
installation page, so the technical sections now read as one system instead of
two unrelated registers.

**What is left of WebGL.** One full-screen fragment shader behind the hero
(`components/gl/MeltBackdrop.tsx`). It has no geometry, nothing to compare
itself against, and it is good at what it does. `lib/gl/shaders.ts` is down to
the two melt shaders; `Stage.tsx`, `Slot.tsx`, `geometry.ts` and `anchors.ts`
are gone, about 1 200 lines.

---

## 4. Compromises, and why

**1. The five colourway photographs stay off-palette.**
`Colors.tsx` shows white, indigo, **green**, graphite and **terracotta**. The
brief says no product image outside the brand palette. These are the deliberate
exception: the section exists to show finishes the factory actually sells, under
a "choose a colour" control, and recolouring them would delete the section's
content rather than fix it. Every other product image on the site is now
ramped into the palette by `scripts/prep-assets.mjs`.

**2. The model slider shows six different camera angles.**
The stills come from six differently framed source stories. Colour is unified by
`scripts/prep-assets.mjs`; framing is not. This used to be a mobile-only problem
because desktop drew the card from the WebGL stage — with the stage gone it is
now what everyone sees. Fixable only with new renders — spec in
`docs/ASSETS.md` §1.

**3. The interior product is separated in CSS, not in the source.**
`Systems.tsx` pushes the room plate back (desaturate / blur / darken), lays a
tighter unfiltered plate of the product over it, and adds a warm key and
convection. It reads well, but it is compositing over one flat photograph
because the source is a white radiator on a white wall. `docs/ASSETS.md` §2 has
the two-plate spec that would remove the trick.

**4. Automated contrast checking cannot see this page's background.**
axe walks up the DOM for a background colour; the backdrop is a fixed *sibling*
of `<main>`, so for light-surface sections it falls back to `html`'s indigo-900
and reports 40 failures that do not exist. Verified by hand against the real
gradient stops instead — worst case across the whole system:

| Token | Light surface | Dark surface |
| --- | --- | --- |
| `fg-strong` | 14.9:1 | 12.3:1 |
| `fg` | 5.9:1 | 8.2:1 |
| `fg-mute` | 4.6:1 | 5.7:1 |
| `mark` (kicker, line art) | 9.0:1 | 10.0:1 |
| `accent` (red as text) | 5.0:1 | 5.0:1 |

Three genuine failures were found and fixed on the way: `fg-mute` was slate at
reduced alpha (3.0:1), the brand red as small text was 4.1:1 light and 2.4:1
dark — hence the separate `--color-accent` that moves one rung per surface —
and the inactive casting steps sat at 0.42 ancestor opacity (4.0:1 and 3.0:1).
Giving each section an opaque background would make axe correct, but it would
also reintroduce the banding the continuous surface exists to remove, so it was
not done.

**5. Mobile Lighthouse performance is 80–86, not ≥ 85 reliably.**
Desktop is 98 (FCP 0.6 s, LCP 1.0 s, TBT 40 ms, CLS 0). Mobile ranges 80–86
across runs on this machine, with LCP swinging 3.0–4.5 s and one contended run
at 55, so the numbers are noisy. The LCP breakdown is unambiguous about the
cause: TTFB 10 ms, resource load 24 ms, **element render delay 1 150 ms** — the
image is there and paint is waiting on hydration. Bytes are not the lever;
already done are a 900 px master cap and quality 82 (734 → 537 KiB), lazy
registration of SplitText and DrawSVG, and deferring the resting-state write for
reveal blocks more than 1.5 viewports down. Closing the rest means deferring the
animation layer itself out of the hydration path — a restructuring with real
regression risk against choreography that is currently verified, so it is
flagged rather than attempted at the end of the work.

**6. "О." was not reproducible.**
The brief lists a stray "О." in the production section. A DOM sweep for orphan
text nodes across all 15 sections found nothing matching. What *was* there is
the defect next to it in the brief: `5 000 000` at `12vw` measured 585 px inside
a 525 px column at 1024 wide and ran under the product image — the RU locale
joins the digits with non-breaking spaces, so it cannot wrap. Now `9.5vw`, the
largest setting where the widest string clears the narrowest column at every
breakpoint. If "О." is still visible, a screenshot would pin it down.

**7. Two dev-only diagnostics ship in the dev bundle.**
`window.__lenis`, `__gsap`, `__anchors` and `__stage` are all behind
`process.env.NODE_ENV !== 'production'`. They exist because this work was
verified programmatically: the preview pane used here does not composite, so
`requestAnimationFrame` never fires, `document.timeline` stays at 0, and neither
screenshots nor CSS transitions nor the GSAP ticker advance on their own. Every
scroll measurement in this rebuild was taken by driving Lenis and
`gsap.ticker.tick()` by hand through those handles.

---

## 5. Verification

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next build` (static export) | clean, 183 kB First Load JS |
| Lighthouse desktop | Perf **98**, A11y 97, Best Practices 100, SEO 100 |
| Lighthouse mobile | Perf 80–86 (see compromise 5), A11y 96, BP 100, SEO 100 |
| Headings clipped by viewport or header | **none**, at all four widths |
| Horizontal page scroll | none at 1920 / 1440 / 768 / 390 |
| Thermal stack fully transparent at any scroll | never — minimum total opacity 1.0 |
| Pure-white section backgrounds | none; lightest surface stop is `#EEF0F8` |
| Section ordinals (02, 04, 07…) | removed; replaced by the hairline progress rail |
