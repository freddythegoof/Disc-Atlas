# Disc Atlas logo system — Tilted Four-Dot Disc

This revision replaces the circular scatter-chart identity with Freddy's supplied
oblong disc. The four variations and the site headers/icons are updated locally.
This revision is uncommitted; there has been no push or deployment.

## Master and review

- [master.svg](master.svg) preserves the supplied 1024px badge geometry and colors.
- [system-review.svg](system-review.svg) shows the four variations together.
- [system-theme-check.svg](system-theme-check.svg) shows every variation across the current themes and legacy dark.
- [system-size-check.svg](system-size-check.svg) shows actual small sizes and single-ink geometry.

The master keeps the rounded obsidian tile (`#0C0E11`, radius 224), flight plate
(`#13161C`), white rim (`#F1F5F9`, width 44), faint coordinate axes, and the
minus 22 degree tilt. The disc radii are 340 and 196. Three white elliptical
waypoints and one larger `#B8FF00` target keep their supplied coordinates.

## The four variations

| Role | SVG | Construction | Recommended minimum |
| --- | --- | --- | --- |
| Primary | [primary.svg](primary.svg) | Master disc and outlined Disc Atlas wordmark, horizontal | 280px wide |
| Secondary | [secondary.svg](secondary.svg) | Master disc above the centered wordmark | 160px wide |
| Simplified | [mark.svg](mark.svg) | Same tilt, rim, plate and four dots; no coordinate axes | 24px |
| Sub-mark | [submark.svg](submark.svg) | Obsidian rounded tile, optically redrawn rim and four dots on a native 16px grid | 16px |

The primary and secondary omit the outer square tile so the lockups sit cleanly
on their surrounding page. The mark omits the axes. The sub-mark retains the
supplied obsidian tile and pure electric lime in every theme. Its rim is 1px and
its dots are slightly enlarged vertically so the four-dot arrangement survives
at native size. None of the variants uses gradients, glow, blur, or shadows.

The existing Space Grotesk Medium wordmark is unchanged and outlined, one
editable path per glyph. It has no font dependency when displayed. Source:
[font-5.ttf](../fonts/font-5.ttf), licensed by The Space Grotesk Project Authors
under the existing [SIL Open Font License](../fonts/Space-Grotesk-LICENSE.txt).

## Theme exports

Each folder contains `primary.svg`, `secondary.svg`, `mark.svg`, and `submark.svg`.

| Theme | Page background | Rim/type ink | Target | Plate |
| --- | --- | --- | --- | --- |
| [light](light/primary.svg) | `#F7F8FA` | `#202731` | `#4D7C0F` | `#EEF0F3` |
| [midnight](midnight/primary.svg) | `#080B10` | `#EDF2FC` | `#B8FF00` | `#13161C` |
| [charcoal](charcoal/primary.svg) | `#101113` | `#F1F2F5` | `#B8FF00` | `#13161C` |
| [paper](paper/primary.svg) | `#F6F2EA` | `#2B2520` | `#4D7C0F` | `#EFE9DE` |
| [dusk](dusk/primary.svg) | `#14110F` | `#F3ECE4` | `#B8FF00` | `#13161C` |
| [black](black/primary.svg) | `#000000` | `#F4F4F4` | `#B8FF00` | `#13161C` |
| [dark](dark/primary.svg), legacy | `#0C1014` | `#F4F7FA` | `#B8FF00` | `#13161C` |

This table applies to the primary, secondary, and simplified mark. The sub-mark
stays obsidian/white/electric lime so it matches the supplied app badge in every
theme. A larger target distinguishes it by size as well as color; no red/green
comparison carries meaning.

The master files follow the embedding color scheme: light by default and
midnight under a dark preference. Fixed-theme files are available when the site
choice differs from the system. Inline palettes use `--da-ink`, `--da-accent`,
`--da-plate`, and `--da-axis`. The badge has separate `--da-badge-ink` and
`--da-badge-accent` overrides for single-ink use without changing its tile.

```html
<img src="/brand/midnight/primary.svg?v=tilted-disc" alt="Disc Atlas" width="342" height="96">
<img src="/brand/midnight/mark.svg?v=tilted-disc" alt="Disc Atlas" width="32" height="32">
```

Preserve aspect ratios. The stacked lockup remains 320 × 300 and can be centered
with contain in a square. Use the supplied 1024px master for large app/avatar
placements, and the dedicated sub-mark for 16px browser icons.

## Site integration

- The atlas, filter context, account page, About, Privacy, and Terms headers use
  the new simplified mark and existing outlined wordmark from [symbols.svg](symbols.svg).
- [site.css](site.css) binds the vectors to the site's selected theme. Page/UI
  color tokens outside the brand are unchanged.
- `public/icon.svg` and `public/favicon.svg` now contain the tilted 16px badge.
  The shared theme handler selects the current theme folder's sub-mark.
- Header symbols, brand CSS, and favicon links use the `tilted-disc` revision
  key so previously cached circular logos do not linger.

## Verification

- `node tests/brand-assets.mjs`: supplied master dimensions/colors, minus 22
  degree rotation, four nodes in all 24 exports, correct axis detail levels,
  updated sprite, native favicon geometry, and no font/raster dependencies.
- `tests/brand-browser.mjs`: five page templates at desktop and mobile widths
  in all four themes, selected-theme plate/accent colors, favicon revision
  links/resources, persisted choices, legacy migration, and keyboard focus
  after clearing manufacturer filters.
- Actual theme exports, the master, and native 16/20/24/32px samples were rendered
  and visually inspected in Chromium. All SVG documents were parsed as XML.
- Fine axes remain secondary details and are removed from the two small variants.

The earlier `concept-*.svg` files are historical studies from the prior direction;
they are not used by the site. The previous circular system is preserved in git.
