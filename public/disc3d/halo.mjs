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

// Halo v2 (docs/halo-band-v2.md): the band in two colours. On top, a pale wash ring from the seam out to the
// dye front, the dye from the front to the edge, blended across the front; the rim wall and underside stay
// full dye. Stored at save in photo_halo as '#rrggbb' (the wash) + HALO_RING bytes in hex, each the front's
// radius at one of HALO_RING evenly spaced angles (angle 0 along the photo's +x, turning toward its +y),
// r/R = 0.5 + byte/510. 39 characters. A copy saved before v2 (or whose band has no wash) has no photo_halo
// and draws its band in one colour, exactly as v1.
export const HALO_RING=16;
// The blend across the front: its 10–90% width as a share of R (tests/halo-band-v2.mjs measures the swirl
// fixture's own feather from the photo).
export const HALO_FEATHER=.045;
export function encodeHalo(model){
 if(!model||!/^#[0-9a-f]{6}$/i.test(model.wash||'')||model.front?.length!==HALO_RING)return null;
 return model.wash.toLowerCase()+model.front.map(r=>Math.round(Math.min(255,Math.max(0,(r-.5)*510))).toString(16).padStart(2,'0')).join('');
}
const HALO_FORMAT=new RegExp('^#[0-9a-f]{'+(6+2*HALO_RING)+'}$','i');
// The two-colour model a bag copy shows, or null: its stored photo_halo, only while it shows a band at all.
export function haloModel(item){
 const value=item?.photo_halo;
 return haloBand(item)&&typeof value==='string'&&HALO_FORMAT.test(value)?value.toLowerCase():null;
}
// '#rrggbb…' → {wash: '#rrggbb', front: [HALO_RING radii as r/R]}; null when malformed.
export function parseHalo(value){
 if(typeof value!=='string'||!HALO_FORMAT.test(value))return null;
 const front=Array.from({length:HALO_RING},(_,i)=>.5+parseInt(value.slice(7+2*i,9+2*i),16)/510);
 return {wash:value.slice(0,7).toLowerCase(),front};
}
// The front at any angle: periodic Catmull-Rom through the ring (the renderers' shader does the same sum).
export function frontAt(front,angle){
 const n=front.length,t=((angle/(2*Math.PI))*n%n+n)%n,i=Math.floor(t),f=t-i,p=k=>front[((i+k)%n+n)%n];
 const [p0,p1,p2,p3]=[p(-1),p(0),p(1),p(2)];
 return .5*(2*p1+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f);
}
