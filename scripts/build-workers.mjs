import {cpSync, mkdirSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import './check-catalog-rights.mjs';

// Package only public assets and the atlas entry, never environment or server files.
const output = new URL('../dist/workers-public/', import.meta.url);
rmSync(output, {recursive: true, force: true});
mkdirSync(output, {recursive: true});
cpSync(new URL('../public/', import.meta.url), output, {recursive: true});
cpSync(new URL('../web/index.html', import.meta.url), new URL('index.html', output));
for (const name of ['bag-plastics', 'bag-models']) {
 cpSync(new URL(`../source-data/${name}.json`, import.meta.url), new URL(`${name}.json`, output));
}
console.log(`Public atlas built at ${fileURLToPath(output)}`);
