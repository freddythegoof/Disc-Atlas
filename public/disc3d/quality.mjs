// The 3D disc viewer's rendering quality (viewer.mjs), in one place so that a surface showing a disc as
// large as the viewer does (My Bag's pulled-out discs) draws it the viewer's way and cannot drift from it.
// segments: the lathe's steps around the axis (a coarse pointer, a phone, takes fewer); detail: the
// profile's sampling (mesh.mjs); maxPixelRatio: the drawing buffer's cap on a dense display;
// environment: how strongly the room environment lights the plastic.
export const DETAIL={segments:80,coarseSegments:56,detail:1,maxPixelRatio:2,environment:.85};
export const detailSegments=()=>matchMedia('(pointer: coarse)').matches?DETAIL.coarseSegments:DETAIL.segments;
export const detailPixelRatio=()=>Math.min(globalThis.devicePixelRatio||1,DETAIL.maxPixelRatio);
// Plan 22's photo decode sizes below the detail viewer's: thumbnails and the atlas 256, Storage racks 512.
// photoTier(px) is the smallest that still covers `px` device pixels across the disc, or null for the
// detail viewer's own size (photoSurface's default, 1024).
export const PHOTO_TIERS=[256,512];
export const photoTier=px=>PHOTO_TIERS.find(size=>size>=px)??null;
