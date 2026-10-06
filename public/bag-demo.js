// The demo bag signed-out visitors see on My Bag: a static, read-only sample of well-known
// catalog molds. It never touches the bag API and holds no user's data; signing in replaces it
// with the player's own saved bag.
export const DEMO_BAG=Object.freeze({bag_model:'Dynamic Discs Commander',capacity:24,main_capacity:20,putter_capacity:4,extra_capacity:0,bag_color:'#343c49',sort_mode:'speed'});

const discs=[
 // Distance drivers
 ['3d60892b6812','Star',173,8,'#ed7868','main',null,'Full-power drives and big hyzer flips.'],
 ['da3c28085382','ESP',174,9,'#70b7cd','main',null,''],
 ['e70f48273d7f','Champion',171,7,'#b99bdd','main',null,''],
 ['4f7f3d501174','Star',170,6,'#a7c68c','main',null,'Turnover distance on open holes.'],
 // Fairway drivers
 ['e9a88cc4f3b1','Champion',172,9,'#e49376','main',null,''],
 ['ba675aed468a','Champion',175,8,'#cf7d9e','main',null,'Headwinds and forehand flicks.'],
 ['df3915bf7676','Star',172,6,'#79b3a8','main',null,''],
 ['f95c107f4dd7','DX',168,5,'#e2d8c1','main','less_stable','Seasoned into a reliable turnover.'],
 ['2e3b6f6dd424','Opto',170,9,'#e6c668','main',null,''],
 // Midranges
 ['7446eb39abe5','ESP',177,7,'#e6c668','goto',null,'Straight shots inside 250 ft.'],
 ['5101421dd2dc','Champion',180,7,'#e49376','main',null,''],
 ['7ba55c559b5b','Star',179,8,'#70b7cd','main',null,''],
 ['7b5b2704666c','Lucid',178,9,'#a7c68c','main',null,''],
 ['850e9dc7104d','ESP',174,7,'#b99bdd','main','more_stable','Spike approaches that stop where they land.'],
 // Putters
 ['3ea9734a60f7','DX',175,4,'#e2d8c1','putter',null,'Putting only.'],
 ['ff4bf9e7743c','Putter Line Hard',174,8,'#cf7d9e','putter',null,''],
 ['761c90d342f5','Electron',174,9,'#e6c668','putter',null,''],
 ['cd8e49f1fa20','Prime',175,6,'#70b7cd','putter',null,''],
 // Storage: off the course for now
 ['3d60892b6812','DX',171,3,'#a7c68c','main','less_stable','Beat in; flips up on command.',true],
 ['5e60dd1ba225','Champion',175,10,'#e6c668','putter',null,'Waiting for a windy round.',true],
];
export const DEMO_DISCS=Object.freeze(discs.map(([mold_id,plastic,weight_g,wear,color,pocket,stability_bias,notes,stored=false],index)=>Object.freeze({
 id:`demo-${String(index+1).padStart(2,'0')}`,mold_id,plastic,wear,weight_g,notes:notes||null,color,in_bag:!stored,pocket,stability_bias,sort_order:index,added_at:'2026-01-01T00:00:00.000Z',
})));
