// Halo plastics (docs/halo-plastic.md): a colourway, not a construction. Innova's Halo Star is Star plastic
// dyed in two colours, the rim in a different dye from the flight plate, so the disc shows a contrasting band.
// It is a fact about one copy (its plastic), never about a mold, and never an overmold: overmold.mjs is
// untouched by it. A Halo copy draws its band as ordinary plastic in a second colour on the same rim seam an
// overmold's rim piece uses (mesh.mjs), and its photo still stops at the shoulder.
//
// The band's colour comes only from the copy's own photo: sampled at save into photo_rim_color, which the
// photo pipeline otherwise only fills for overmolds. No photo, no band: there is no default Halo colour (the
// dye combinations change run to run). Pure JS, no three.js, so Node tests read it.

// Every Halo option in source-data/bag-plastics.json (tests/halo-plastic.mjs keeps the two in step).
export const HALO_PLASTICS=Object.freeze(['Halo Star','Halo S-Blend']);
const NAMES=new Set(HALO_PLASTICS.map(name=>name.toLowerCase()));

export function isHalo(plastic){
 return typeof plastic==='string'&&NAMES.has(plastic.trim().replace(/\s+/g,' ').toLowerCase());
}

// The band colour a bag copy shows, or null: its photo's sampled band, while it is a Halo copy with a photo.
// A stale sample (the plastic since changed away from Halo) is ignored; overmold renderers ignore it too.
export function haloBand(item){
 const band=item?.photo_rim_color;
 return isHalo(item?.plastic)&&item?.texture_key&&typeof band==='string'&&/^#[0-9a-f]{6}$/i.test(band)?band.toLowerCase():null;
}
