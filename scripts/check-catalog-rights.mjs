import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('public/data.json','utf8'));
if(data.discs.some(d=>Object.keys(d).some(k=>k.startsWith('photo'))))throw Error('Unreviewed catalog photo metadata detected. Do not deploy until image rights are reviewed.');
if(fs.existsSync('public/photos')&&fs.readdirSync('public/photos').length)throw Error('Unreviewed third-party catalog photos are in public assets.');
if(!fs.existsSync('public/art/disc-base.png'))throw Error('Original illustration asset is missing.');
console.log(`Catalog artwork gate passed for ${data.discs.length} records. Data-source permissions remain a separate launch requirement.`);
