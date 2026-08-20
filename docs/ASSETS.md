# Assets to produce outside this repo

Everything the site currently ships is derived from the Calido story exports in
`C:/Users/user/Desktop/calodi` by `scripts/prep-assets.mjs` (`npm run prep:assets`).
That pipeline crops, mattes to alpha, recolours into the brand palette and emits
one WebP master per asset plus `content/assets.generated.ts`.

Two things it cannot do, because the information is not in the source: give the
six models a shared camera, and give the interior photograph a product that is
separable from its wall. Everything below is what would remove the remaining
compromises. Nothing here blocks the site — each item has a working stand-in.

---

## 1. Model range — six renders on one camera (highest value)

**Why.** The six source stories were shot at six different angles and crops:
three tight diagonals, two full elevations, one three-quarter. This used to be
hidden on desktop, where the model card was drawn by the WebGL stage from the
real per-model dimensions; that stage has been retired, so the stills are now
what everyone sees and the mismatched framing is visible at every width. Colour
is already unified by the pipeline; framing is not. This is now the single
highest-value asset job on the list.

| Field | Value |
| --- | --- |
| Files | `infinity`, `elegant`, `elegant-premium`, `classic`, `bravo`, `classic-350` |
| Format | PNG with straight alpha (the pipeline converts to WebP) |
| Resolution | 1800 × 2000 px minimum, product filling ≥ 85% of the frame height |
| Camera | Identical for all six. Light isometric: ~12° yaw, ~6° pitch, orthographic or ≥ 85 mm equivalent |
| Sections shown | 5, butted, full height including both manifolds and the feet |
| Finish | Bare anodised aluminium. The pipeline re-ramps to `metal` regardless, so a neutral grey render is ideal |
| Lighting | One large softbox top-left, indigo bounce right, no coloured gels |
| Background | Transparent. No contact shadow baked in — the page draws its own |
| Scale | **Not** normalised. Each model at its true section height (553 / 586 / 576 / 575 / 565 / 425 mm) against a common camera, so the stills carry the real size relationship between models |

## 2. Interior scene — product separable from the room

**Why.** `8 (3).png` is a white radiator on a white wall with a blown-out window
filling the left third. The section currently recrops away the window and
separates the product by treating the room plate (desaturate, blur, darken) and
laying a tighter unfiltered plate of the product back over it. That works, but
it is a compositing trick over a single flat photograph.

Either of these removes it:

**(a) Two plates, same camera** — preferred, and cheap if the render is CGI.

| File | Content | Format |
| --- | --- | --- |
| `interior-room.png` | The room with the radiator **removed** | Opaque, 2000 × 1400 |
| `interior-product.png` | Only the radiator, same camera and lighting | Straight alpha, 2000 × 1400, product ≥ 60% of width |

**(b) One frame, coloured product** — a re-shoot or re-render with the radiator
in `indigo` or `graphite` rather than white, so it separates from the wall
optically instead of in CSS. 2000 × 1400, opaque, radiator as the compositional
centre with no window in frame.

## 3. Optional — casting sequence as footage

The three casting stages are one continuous SVG cross-section
(`components/sections/CastingDiagram.tsx`: closed die → metal rising under
pressure → die opening onto a cooling section), driven by the pin's scroll
progress. It needs no assets at all and is resolution-independent.

Photography cannot replace it — the interesting half of the sequence happens
inside a closed steel die. If a rendered sequence is ever preferred over the
drawing:

| Field | Value |
| --- | --- |
| Form | Image sequence, **not** video — it has to scrub against scroll position, and seeking a video per frame stutters |
| Frames | 60, numbered `cast-000.webp` … `cast-059.webp` |
| Resolution | 1400 × 1600 |
| Alpha | Required — the page background shows through |
| Content | Frames 0-17 closed die, 18-39 pour at full heat, 40-59 die opening and the casting cooling from ember through `#D91222` to bare alloy |
| Budget | ≤ 40 kB per frame (2.4 MB total). Above that the procedural version is the better trade |

## 4. Optional — real colourway photography

`components/sections/Colors.tsx` shows five real factory finishes (white,
indigo, green, graphite, terracotta) using the identically framed swatch crops
from the spec sheets. These are the **one deliberate exception** to "no product
imagery outside the brand palette", because the section exists to show finishes
the factory actually sells and recolouring them would delete its content.

If better sources appear, keep the constraint that makes the switcher work:
identical framing, identical lighting, identical camera, one file per finish,
straight alpha, ≥ 900 px tall.

---

## Not needed

- **HDRI environment map.** The one shader left on the site is the hero melt
  backdrop, which has no geometry to light. It synthesises its colour from the
  palette (`lib/gl/shaders.ts`); a downloaded HDRI would drag a foreign colour
  cast into an indigo-and-red page.
- **Radiator CAD/GLTF.** There is no 3D layer any more. The section anatomy is
  an annotated photograph and the casting sequence is a drawing, so nothing on
  the site would load a mesh.
- **Exploded-view render.** `Anatomy.tsx` annotates `models/bravo.webp`
  directly. If that photograph is ever replaced, the four anchor points in
  `ANCHORS` are fractions of the image and must be re-measured against the new
  one.
- **Icon set.** Every mark on the page is drawn inline.
