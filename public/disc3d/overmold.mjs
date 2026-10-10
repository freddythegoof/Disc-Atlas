// Overmold discs (Plan 12): molds whose rim is a separate molded piece from the flight plate, like MVP's
// GYRO construction, usually in a second colour. The 3D viewer draws them in two materials.
//
// Detection is per disc, never per brand: the Innova Atlas is an overmold although Innova's other molds
// are not, and Streamline, part of the MVP/Axiom family, molds in one piece. Discs that are only two-tone
// in colour (swirls, bursts, blends) but molded in one piece are not overmolds. A record's own boolean
// `overmold` flag wins; otherwise the record must be on the verified list below, keyed by PDGA
// manufacturer and PDGA record name exactly as data.json has them. Sources are in docs/disc-3d-viewer.md.
// Pure JS, no three.js, so Node tests read it.

// Left off until verified: MVP's Mass (approved Aug 2026, no description found) and Axiom's three Simon
// Line Balance prototypes. All four are unrated, so the viewer doesn't draw them today anyway.
const LIST={
 'MVP Disc Sports':['Amp','Anode','Atom','Axis','Beam','Catalyst','Control','Cypher','Deflector','Detour','Dimension','Energy','Entropy','Glitch','Impulse','Inertia','Ion','Limit','Matrix','Motion','Nitro','Nomad','Octane','Ohm','Orbital','Particle','Phase','Photon','Reactor','Relativity','Relay','Resistor','Servo','Shock','Signal','Spin','Stasis','Switch','Tangent','Teleport','Tensor','Terra','Tesla','Trail','Uplink','Vector','Vertex','Volt','Watt','Wave','Zenith'],
 'Axiom Discs':['Alias','Aspect','Bokeh','Clash','Crave','Defy','Delirium','Envy','Excite','Fireball','Hex','Insanity','Inspire','Mayhem','Panic','Paradox','Pitch','Pixel','Proxy','Pyro','Rhythm','Tantrum','Tempo','Tenacity','Theory','Thrill','Time-Lapse','Time-Lapse (retooled)','Trance','Vanish','Virus','Wrath'],
 'Innova Champion Discs':['Atlas','Avatar','Nova'],
 'Latitude 64':['Bryce','Gobi','Sarek','Zion'],
 'Yikun Discs':['Meteor Hammer (流星锤)','Tomahawk (八卦钺)','Twin Swords (双刃剑)'],
};
export const OVERMOLD_DISCS=Object.freeze(Object.fromEntries(Object.entries(LIST).map(([m,names])=>[m,Object.freeze([...names])])));
const KEYS=new Set(Object.entries(LIST).flatMap(([m,names])=>names.map(n=>m+'|'+n)));

// {manufacturer, record} are the PDGA manufacturer and record name (d.manufacturer, d.name).
export function isOvermold({overmold,manufacturer,record}={}){
 if(typeof overmold==='boolean')return overmold;
 return KEYS.has(manufacturer+'|'+record);
}

// Colours: CSS hex or rgb()/rgba() in, '#rrggbb' out. Defaults keep the disc's own colour on the flight
// plate, where it covers most of the top, and give the rim a darker shade of it (a lighter one when the
// disc is already very dark, so the seam still shows). Either part can be set on its own: `rim` and
// `plate` override the defaults (bag colour choices later), and anything unreadable falls back.
export const DEFAULT_DISC_COLOR='#8a8f98';
export function overmoldColors(base,{rim,plate}={}){
 const plateRgb=parseColor(plate)||parseColor(base)||parseColor(DEFAULT_DISC_COLOR);
 const rimRgb=parseColor(rim)||rimShade(plateRgb);
 return {plate:toHex(plateRgb),rim:toHex(rimRgb)};
}

function rimShade(rgb){
 const [h,s,l]=rgbToHsl(rgb);
 return hslToRgb(h,Math.min(1,s*1.1),l>=.2?l*.5:Math.min(.85,l+.28));
}

export function parseColor(value){
 if(typeof value!=='string')return null;
 const v=value.trim().toLowerCase();
 let m=v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
 if(m){const h=m[1].length===3?[...m[1]].map(c=>c+c).join(''):m[1];return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
 m=v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
 if(m){const rgb=m.slice(1,4).map(Number);return rgb.every(c=>Number.isFinite(c)&&c<=255)?rgb.map(Math.round):null;}
 return null;
}
const toHex=rgb=>'#'+rgb.map(c=>Math.round(Math.min(255,Math.max(0,c))).toString(16).padStart(2,'0')).join('');
function rgbToHsl([r,g,b]){
 r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
 if(!d)return [0,0,l];
 const s=d/(1-Math.abs(2*l-1));
 const h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
 return [h*60,s,l];
}
function hslToRgb(h,s,l){
 const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 const [r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
 return [r,g,b].map(v=>(v+m)*255);
}
