# Disc Atlas logo system — Scatter Atlas

Freddy selected concept 03 and kinetic lime, approved the four variations, and
authorized site integration. The compact header branding and browser icons are
now integrated into the site.

## Review

- [System review](system-review.svg): all four variations, plus native-size samples.
- [Theme check](system-theme-check.svg): every variation in all current themes and legacy dark.
- [Size and single-ink check](system-size-check.svg): 16–32px badge, 24–48px simplified mark, and neutral versions.

## The four variations

| Role | Master SVG | Construction | Recommended minimum |
| --- | --- | --- | --- |
| Primary | [primary.svg](primary.svg) | Detailed scatter-atlas mark plus horizontal Disc Atlas wordmark | 280px wide |
| Secondary | [secondary.svg](secondary.svg) | Detailed mark above centered wordmark; fits a square using contain | 160px wide |
| Simplified | [mark.svg](mark.svg) | Stronger rim, six ordinary nodes, one hollow selected node; no axes or contours | 24px |
| Sub-mark | [submark.svg](submark.svg) | Native 16px grid, three small nodes and one larger solid selected node | 16px |

The primary and secondary preserve the chosen concept's circular disc,
speed/stability axes, contour traces, and clustered nodes. The stray origin dot
was removed and the selected node's hole made transparent. Every smaller mark
is drawn separately. The sub-mark makes the selected node solid so it retains
weight at 16px; its greater size also distinguishes it without color.

The wordmark uses Space Grotesk Medium from the site's existing
[font-5.ttf](../fonts/font-5.ttf). Each glyph is a native vector outline, not an
image trace. The SVGs contain no text objects and require no installed fonts.
Source font: The Space Grotesk Project Authors; see its existing
[SIL Open Font License](../fonts/Space-Grotesk-LICENSE.txt).

## Theme-specific exports

Each folder contains the same four filenames: `primary.svg`, `secondary.svg`,
`mark.svg`, and `submark.svg`. Use these files for an HTML image when the site's
selected theme may differ from the operating system's preference.

| Theme folder | Background checked | Ink | Accent | Accent contrast |
| --- | --- | --- | --- | --- |
| [light](light/primary.svg) | `#F7F8FA` | `#202731` | `#4D7C0F` | 4.70:1 |
| [midnight](midnight/primary.svg) | `#080B10` | `#EDF2FC` | `#B8FF00` | 16.27:1 |
| [charcoal](charcoal/primary.svg) | `#101113` | `#F1F2F5` | `#B8FF00` | 15.60:1 |
| [black](black/primary.svg) | `#000000` | `#F4F4F4` | `#B8FF00` | 17.34:1 |
| [dark](dark/primary.svg), legacy | `#0C1014` | `#F4F7FA` | `#B8FF00` | 15.77:1 |

The four master files follow `prefers-color-scheme`: light by default and
midnight under a dark system preference. When inlined, their palette can be
set with `--da-ink` and `--da-accent`. Fixed-theme files set both variables on
the root SVG. For a neutral single-ink version, set both to the same color.

```html
<img src="/brand/midnight/primary.svg" alt="Disc Atlas" width="342" height="96">
<img src="/brand/midnight/mark.svg" alt="Disc Atlas" width="32" height="32">
```

The first example shows intrinsic sizing; use the simplified mark when the
available size cannot retain the detailed chart. Keep each SVG's aspect ratio.
The stacked lockup's viewBox is 320 × 300; center it with contain for square
spaces. Avoid placing the full chart in a 16px favicon slot.

## Construction and verification

- Every identity export uses editable SVG paths; the wordmarks are outlined.
- Assets contain no raster images, external resources, scripts, filters, or fonts.
- Backgrounds are transparent, including the highlighted node's opening.
- Masks in the detailed lockups remove axis/contour lines beneath that opening.
  Their IDs are scoped by variation. Namespace IDs when repeating inline copies;
  external images keep their SVG documents isolated.
- Every fixed-theme export was loaded as an actual image in Chromium, rather
  than relying only on the vector presentation board.
- All variations were visually checked on light, midnight, charcoal, black,
  and legacy dark. The badge was checked at actual 16px, 20px, 24px, and 32px.
- Single-ink checks preserve recognition through silhouette, node size, and
  the hollow focal node. No red/green distinction carries meaning.
- Fine calibration lines are secondary details; they are deliberately removed
  from the simplified mark and sub-mark.

## Site integration

- The atlas, filter context, account page, About, Privacy, and Terms headers use
  the simplified mark. Their compact wordmarks use the exact outlined glyphs
  from the approved primary lockup, exposed through [symbols.svg](symbols.svg).
- [site.css](site.css) maps the shared vectors to the selected site theme. The
  palette is scoped to brand variables; other site color tokens are unchanged.
- `public/icon.svg` and `public/favicon.svg` now contain the approved 16px
  sub-mark with a system-preference fallback. Page icon links switch to the
  selected theme's fixed sub-mark through the existing `theme.js` handler.
- The Next metadata also references the new SVG favicon, with a cache key.
- Browser regression: `tests/brand-browser.mjs` checks five page templates at
  desktop and mobile widths in all four site themes, actual SVG icon resources,
  theme persistence and legacy migration, and filter-context keyboard focus.

No push or deployment has been made. The review sheets show the four
approved variations; the primary and stacked files remain available for larger
placements without squeezing the detailed chart into compact headers.

The earlier `concept-*.svg` studies remain available as Phase 1 history. Their
background-matched focal-node inset is superseded by the transparent opening
in this system's detailed lockups.
