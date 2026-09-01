# White page, colour plates

Third pass. The site's background is now white on every page and every route,
and colour arrives as **plates**: opaque rectangles of one brand colour laid on
top of that white, each carrying its own ink.

This supersedes the thermal surface described in [REBUILD.md](REBUILD.md) and in
[MULTIPAGE.md](MULTIPAGE.md) §2–§3. Those documents are accurate history and
their routing table is still current; their colour model is not.

---

## 1. What was wrong

The brief was one sentence: white background, colour on top, and the home page
should stop opening red.

The previous system was the exact inverse. `lib/thermal.ts` defined seven
full-viewport gradients — molten, cooling, cinder, deep, light, lightWarm, close
— and `ThermalBackdrop` stacked six of them behind every section and crossfaded
between them on scroll. Sections had no background of their own; the gradient
*was* the page. On top of the hero sat `MeltBackdrop`, a full-screen fragment
shader (four octaves of domain-warped noise, `ogl`, its own lazy chunk).

Three things followed from that, and all three were the complaint:

- **The home page was a red screen.** Not red as an accent — red as the
  background, at 100% of the first viewport. Once a visitor has read a whole
  screen of red there is nothing left for a call to action to be.
- **The product renders had nowhere to sit.** They are dark blue studio shots on
  transparent backgrounds. Dropped onto a dark gradient they needed a mask, a
  contact shadow and a two-axis edge feather each — three treatments that exist
  only to stop an image from fighting its own backdrop.
- **The 3D never paid for itself.** Two WebGL scenes had already been cut in the
  previous pass for losing to the photography beside them. The hero melt was the
  survivor, and it was the most expensive thing on the page.

## 2. The system

`lib/plates.ts` is the whole of it: five fills, the polarity each one demands,
and one page floor.

| Plate | Fill | Ink | Used for |
| --- | --- | --- | --- |
| `indigo` | `#22337E` | white | topbar strip, page headers, the closing CTA band, feature badges |
| `ink` | `#0D1338` | white | the footer, and page headers that need more weight than indigo |
| `red` | `#D91222` | white | buttons, the active step, the contact page's header |
| `paper` | `#EEF0F8` | ink | quiet panels — the block behind the hero render, spec cards |
| `white` | `#FFFFFF` | ink | a plate that is carried by its hairline rather than its fill |

`components/ui/Plate.tsx` is the only way a component asks for a coloured
background. It applies the fill and `.on-dark` together, so a plate cannot be
recoloured later and leave white text on a light surface. Inside a plate,
`text-fg-strong` resolves to white and `--color-mark` to `indigo-100`, which is
why nothing in this codebase writes `text-white` at a call site that did not
already know it was on colour.

`PlateBadge` is the second export: a solid square pulled up by `-mt-8` so it
overhangs the top edge of the cell it sits in. It is lifted from the source
template (`btn-xxl-square bg-primary mt-n4`) and it is the single most legible
statement the system makes — the square visibly breaks the cell's border, so the
colour is demonstrably *on* the white rather than inside it.

Corners are square everywhere. The pill radius that used to be on every button
is gone; the only round things left on the site are the colour swatches on the
models page and the ripple inside `WaveButton`.

## 3. Structure

Every page is now five bands, and three of them are plates:

```
TopBar        indigo strip — the brand and three facts, desktop only
Header        white, sticky, hairline bottom border
PageHeader    the page's own plate: breadcrumb, title, description, red seam
main          white — every section, every image, every diagram
SiteFooter    ink plate
```

The home page is the one exception: it opens on its hero instead of a page
header, because a hero preceded by a title band is a page announcing itself
twice.

Two consequences worth stating, because both were problems before:

- A contrast checker walking up the DOM from any text node now lands on an
  opaque ancestor — white, or one plate colour. The `SURFACE_BASE` stand-in
  colours that existed to give axe something to measure against are gone with
  the thing they were standing in for.
- A page cannot invert under the reader, because a plate is a box with edges
  rather than a viewport-sized layer that fades in on scroll. Page Theme Lock
  holds by construction rather than by rule.

## 4. What was deleted

| Path | Why |
| --- | --- |
| `lib/thermal.ts` | The seven gradients and the layer table. Replaced by `lib/plates.ts`. |
| `components/layout/ThermalBackdrop.tsx` | The fixed six-layer crossfade stack. |
| `components/gl/`, `lib/gl/` | `MeltBackdrop`, `GLLayer`, the shaders and the capability probe. |
| `ogl` (dependency) | Nothing imports it any more. |
| `SURFACE`, `PAGE_POLARITY`, `SURFACE_BASE`, `CHROME_COLOR[polarity]` | Per-section and per-page polarity lookups. There is one polarity now, and plates declare their own. |
| `.section-pad-seam`, `--seam-h` | Rhythm for a seam band that no longer exists. |
| The fixed-bar clearance rule in `globals.css` | The header is `position: sticky`, so it occupies its own row and the first section clears it by construction. |

## 5. Adjustments the white floor forced

These are the places where a colour was correct on deep indigo and wrong on
white, and they are worth listing because each one is a real legibility bug
rather than a taste call.

| Where | Was | Now |
| --- | --- | --- |
| `Warranty` — the word "лет" over the giant numeral | `indigo-300`, 2.3:1 on white | `red-500`, 4.2:1 — over AA for display text |
| `CastingDiagram` — centreline and parting ticks | `indigo-300` at 38–55%, invisible on white | `indigo-500`. Every other stroke in that drawing sits on the dark die block and stays light. |
| `Anatomy` — the leader overlay | dark halo under a light stroke | white halo under an `indigo-500` stroke. The leaders run from white page onto a dark product, so the halo has to be the light half. |
| `Overview` — the lead destination cell | a red-to-maroon radial wash | an indigo plate. On white the gradient was a pale pink smear with no edge. |
| `--color-surface-card` | `rgba(255,255,255,0.5)` | `#F4F6FC`. A 50%-white panel on a white page is not a panel. |
| `RequestForm` on `/contact` | `tone="dark"` | `tone="light"`. The floating CTA's copy stays dark — that one renders inside an indigo dialog. |

## 6. Content notes

Two constraints from the brief, both already satisfied and recorded here so they
are not undone by accident:

- **No people.** There are none, and there never were: every asset in `public/`
  is a product render, a colour swatch or a logo. The source template's team and
  testimonial pages were not carried over.
- **No gallery.** There is no gallery route and no lightbox. `Colors` on the
  models page is a specification of the five factory finishes, not a gallery of
  them; `Scale` is a comparison chart.

The topbar carries production, capacity and warranty rather than the phone,
e-mail and address the source template puts there. Those three are still
`уточняется` in `contact.details`, and a strip of three "TBD" plates would be
worse than no strip.
