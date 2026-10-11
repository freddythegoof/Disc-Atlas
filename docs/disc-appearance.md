# Shared disc appearance

The Bag viewer uses the canonical per-mold profile and overmold material groups from `disc3d/mesh.mjs`. Geometry is oriented and fitted to the existing pocket envelope, so packing, hit targets, staging and label rules keep their dimensions. Mold metadata and each copy's plate/rim colors travel through the Bag slots. Detection remains per disc; a record's explicit overmold flag wins.

`BagApp.mapColors()` keeps its existing mold-to-plate API. `mapRimColors()` exposes rims from the same first copy in bag order. Both colors participate in the bag-change event and My Map invalidation. Storage and Lost copies are excluded. My Map uses the shared atlas art, including its existing tiny dot footprints.

Atlas art accepts an optional fourth `rim` argument in `render`, `get` and `has`. `getAtlasArt()` shares one renderer and its bounded geometry/image caches between the map and lists. Directory rows use the type palette and automatic rim; Bag and Storage list rows use each physical copy's colors. IntersectionObserver queues visible thumbnails within a frame budget. Rows copy cached canvases, so repeated molds never steal images from each other or the map. Existing fallbacks remain when WebGL is unavailable.

No data or migration changes.

Verification:

- `npm run test:appearance`: Pyro teal/purple and Tempo white/blue, atlas pixels and cache isolation, Bag materials/defaults/single-mold exceptions, My Map color invalidation, add/remove/Storage/Lost/found transitions, lazy thumbnails and dot tiers.
- Existing Bag, overmold, personalized-map, atlas GPU and Directory suites cover persistence, interactions, phone layouts, themes, and unchanged map/label geometry.
- Example review images are generated in `outputs/disc-appearance/`.
