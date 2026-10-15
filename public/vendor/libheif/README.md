# libheif-js 1.23.5

`libheif-bundle-1.23.5.mjs` is the **unmodified** ES module from
`libheif-js@1.23.5/libheif-wasm/libheif-bundle.mjs`, renamed to pin its version.
It includes WASM; it makes no separate codec or network request.

- Package: https://registry.npmjs.org/libheif-js/-/libheif-js-1.23.5.tgz
- Source and build scripts: https://github.com/catdad-experiments/libheif-js
- Upstream libheif: https://github.com/strukturag/libheif
- Upstream HEVC decoder: https://github.com/strukturag/libde265
- Distribution licenses are alongside the asset: `LICENSE.libheif-js` and
  `LICENSE.codecs` (LGPL; the latter includes the GPL text it incorporates).
- SHA-256: `095194187be00d3e36335b8ad7f5552d70655e5e2159486d7d36cd4daa47bba9`
- Raw: 2,043,959 bytes; gzip level 9: 713,695; Brotli defaults: 515,490.

To reproduce this file, download the exact package above, extract it, and copy
`package/libheif-wasm/libheif-bundle.mjs` without modifying its contents. Verify
the hash. The versioned, separate module can be replaced with an
interface-compatible build; it is not bundled into the application's source.
`disc-photo.mjs` dynamically imports it only after both native decode paths
fail for a byte-identified HEIC/HEIF photo. Original photo data stays local.
