# About hero: review notes

The About page now has an original, hero-scoped constellation fragment shader on
a Three.js fullscreen quad. The previous page was entirely static. The existing
copy and information sections are preserved, with more space and a larger heading
in the hero. The inherited mobile rule that hid the heading is overridden here.

## Reference and license decision — September 30, 2026

Reference: [The Universe Within, BigWings](https://www.shadertoy.com/view/lscczl).
Shadertoy's shader page and terms could not be retrieved during the license check
(the shader page returned an HTTP 402 to the research tool). A published
[adaptation's credits](https://steamcommunity.com/sharedfiles/filedetails/?id=2440553694)
identify the reference and report CC BY-NC-SA 3.0. This is secondary evidence,
not verification of the author's current license or a commercial exception.

Decision: **do not port the reference**. No reference shader source was copied,
translated, or used. The new shader independently implements a jittered triangular
field at three scales. Only the requested atmosphere—warm luminous connections,
dark depth, slow drift, and subtle parallax—guides the design.

Three.js is imported from the pinned jsDelivr URL for version 0.180.0; no npm
dependency or global bundle changes. Its library license is separate from the
reference shader's license. CDN imports follow the
[Three.js installation guidance](https://threejs.org/manual/pages/installation.html).

## Appearance and budget

- Shared `--distance` terracotta plus a local warm amber token; deep black stage.
- Three independently drifting layers, eased mouse input, five-second fade, and
  a small exponentially settling entrance scale. No brightness oscillation.
- Central radial scrim and bottom fade keep the existing copy readable.
- Both Midnight and Charcoal support the shader. Light mode uses warm paper and
  a static gradient. Mobile under 700px and reduced motion use static gradients.
- 0.625× CSS resolution on each axis, independent of device pixel ratio: roughly
  39% of the native CSS pixel count. Single pass, no textures or postprocessing.
- 30 fps cap. IntersectionObserver and document visibility stop animation work;
  resume preserves elapsed shader time, without a catch-up jump.
- No CDN request for an initially ineligible or WebGL2-unavailable visitor.
  CDN failure, shader failure, and context loss retain the CSS fallback.

## Verification and review artifacts

`scripts/about-hero.test.mjs` runs a local public-assets server and Chromium.
It counts real WebGL draw calls, tests offscreen pause/resume, theme changes,
the 699/700px boundary, reduced motion, no WebGL, CDN failure, and context loss.
The visibility listener is tested with a synthetic visibility change because
headless tab focus does not reliably reproduce desktop tab visibility.

Measurements use five-second samples after entrance, at 1440×900. Chromium CPU
throttling is 4× for the second sample; this is not GPU throttling or a guarantee
for other hardware. The initial passing run measured 29.998 fps normally and
30.001 fps at 4× CPU slowdown, with zero draws while offscreen. The final run's
exact results are saved in `outputs/about-hero/measurements.json`.

Screenshots in `outputs/about-hero/`: `before.png`, `dark-desktop.png`,
`charcoal-desktop.png`, `light-desktop.png`, `mobile.png`, `reduced-motion.png`.
These are local review artifacts, excluded by the repository's existing ignore.

Run with an existing Playwright installation:

```powershell
$env:PLAYWRIGHT_MODULE='file:///absolute/path/to/playwright/index.mjs'
$env:CHROMIUM_PATH='C:/absolute/path/to/chrome.exe'
node --test scripts/about-hero.test.mjs
```

`PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` are optional when the local installation
and Playwright-managed browser are available. Production build passed. Scoped
lint passed. Repository-wide lint has 20 existing errors in `app/api/bag/route.ts`,
`app/api/coach/route.ts`, `lib/server.ts`, `lib/validation.ts`, `tests/api.cjs`, and
`tests/shopping.cjs`, plus existing warnings. None are in the new files.
