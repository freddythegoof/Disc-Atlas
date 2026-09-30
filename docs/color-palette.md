# Disc and brand colors

The default data palette uses the seven [Okabe-Ito hue families](https://jfly.uni-koeln.de/color/#pallet). Warm orange, ochre-yellow, and vermillion retain warmth alongside the existing disc gradients. The site's surfaces and editorial accents are unchanged; the About page's terracotta link has its own token.

`public/cosmic.css` owns the theme colors. `applyTheme()` reads them once per theme change for markers, brand legends, and flight comparisons. Disc types use reddish purple (putter), bluish green (midrange), blue (fairway), and orange (distance).

| Brand slot / hue | Light | Dark (midnight and charcoal) |
| --- | --- | --- |
| 1 / blue | `#0072b2` | `#0072b2` |
| 2 / orange | `#ce8a00` | `#e6a139` |
| 3 / bluish green | `#008c67` | `#009e73` |
| 4 / reddish purple | `#bc719b` | `#cc79a7` |
| 5 / sky blue | `#56b4e9` | `#56b4e9` |
| 6 / yellow | `#e8d66a` | `#e8da78` |
| 7 / vermillion | `#bd5019` | `#d55e00` |

Small map dots and legend swatches have a neutral contrasting edge. Brand names remain on large markers and on hover/focus labels for small markers. Marker accessible names include the brand and disc type. Map position continues to encode speed and stability. Comparison lines retain their solid/dashed/dotted encoding.

As before, brand slots follow selection order and repeat after seven brands. Labels remain the definitive identifier; a finite palette cannot uniquely identify unlimited brands.

## Verification

With the local site running, use `node tests/palette.mjs`. Set `PLAYWRIGHT_MODULE` to an existing Playwright package path if necessary; `ATLAS_URL` defaults to `http://localhost:5173`.

The test reads the rendered theme tokens and checks all pairs under normal vision and full-severity Machado protanopia/deuteranopia simulations. The minimum OKLab distance is 0.076 across the final palettes (regression floor: 0.065). The threshold is a project regression guard, not a medical or accessibility certification. Dot fill or edge contrast is at least 3:1 against the map background; the test also verifies the edge renders. Chromium vision-deficiency screenshots provide a separate visual review of the actual gradients and labels. Individual perception can vary.

Review screenshots and simulation variants are in `outputs/palette/` (ignored by git): `types-light.png`, `types-dark.png`, `brands-light.png`, and `brands-dark.png`. The type view includes all four types; the brand view includes six brands. `validation.json` contains the numeric results.

Existing motion, theme/premium, filter-regroup, context-header, desktop/mobile redesign, layout, shopping, and Worker checks passed. The About shader performance test fails on this machine at roughly 19 FPS against its >25 FPS requirement, including with the original CSS. Repository lint has 20 errors in unchanged files.
