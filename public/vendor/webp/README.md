# @jsquash/webp 1.5.0 — encoder only

Source: https://github.com/jamsinclair/jSquash

Pinned archive: https://registry.npmjs.org/@jsquash/webp/-/webp-1.5.0.tgz

Archive integrity: `sha512-KggLoj2MnRSfIqTeKe1EmbljTX2vuV7mh79k89PCL1pyqiDULcPM1L47twxXt0hkb68F70bXiL31MxsuoZtKFw==`

Unmodified files copied from that archive (SHA-256):

- `package/codec/enc/webp_enc.js` → `1.5.0/webp_enc.js`: `5fd62301662e37785aec38e38807926f72933d4c8b919018a43faf1b1ca760f6`
- `package/codec/enc/webp_enc.wasm` → `1.5.0/webp_enc.wasm`: `b6085bb6702f144e9dc6016d58d230b34a84976bf0d080b7390b4b4b137d6ab7`
- `package/meta.js` → `1.5.0/meta.js`: `3d70163a00e6264fc5a8fa7c8f3b1fa21a50a00d910f4d2de3ef1bbd2fdc98ab`
- `package/LICENSE` → `1.5.0/LICENSE` (Apache-2.0)
- `package/codec/LICENSE.codec.md` → `1.5.0/LICENSE.codec.md` (Google codec BSD license)

The portable non-SIMD encoder avoids the upstream wrapper's additional feature-detection dependency and SIMD payload. No decoder is included. The application wrapper `disc-webp.mjs` calls the original factory and its `encode` API with the original default options and the requested quality × 100. Pixels are bounded to 1024 square before encoding. No original file or metadata reaches this codec.

Three executable vendor files total 320,675 bytes raw, 125,708 gzip level 9, 100,587 Brotli defaults (sum of separately compressed assets). The local wrapper adds 1,194 raw / 612 gzip / 518 Brotli bytes. All are lazy, same-origin resources; none is fetched when canvas WebP works. `.gitattributes` preserves upstream bytes across checkouts.
