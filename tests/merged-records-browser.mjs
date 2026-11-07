// The merged FD1 / FD2 record on the real Worker and a local D1: the catalog views, then a bag saved before the merge.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {startHarness} from './display-harness.mjs';
import {checkCatalogIdentity} from './catalog-identity-browser.mjs';

const dir='work/merged-records',state=dir+'/d1',FOLDED='3bd98a3bc639',SURVIVING='3d70ef38ff0e';
fs.mkdirSync(dir,{recursive:true});
const sql=command=>JSON.parse(execFileSync(process.execPath,['node_modules/wrangler/wrangler-dist/cli.js','d1','execute','disc-atlas-accounts','--local','--json','--config','tests/auth.wrangler.jsonc','--persist-to',state,'--command',command],{windowsHide:true,stdio:'pipe'}).toString())[0].results;
const h=await startHarness({port:8871,state}),{page}=h;
try{
 await checkCatalogIdentity(h.browser,h.base);

 await h.signIn();
 await h.seedBag([{mold_id:SURVIVING,plastic:'C-Line',wear:9,weight_g:175,color:'#70b7cd'}]);
 // The app can no longer save the folded ID, so age the row by hand to what an existing account holds.
 sql(`UPDATE bag_discs SET mold_id='${FOLDED}'`);
 assert.deepEqual(sql('SELECT mold_id FROM bag_discs').map(r=>r.mold_id),[FOLDED]);

 await page.goto(h.base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current?.user);
 const name=page.locator('#bagLineup .my-bag-disc-name');await name.waitFor();
 assert.deepEqual(await name.allTextContents(),['FD2'],'The saved disc stays in the bag under its current name');
 const id=await page.locator('#bagLineup .my-bag-disc').getAttribute('data-disc-id');
 assert.equal((await (await page.request.get(h.base+'/api/bag/discs/'+id)).json()).disc.mold_id,SURVIVING);

 await name.click();await page.locator('#detail:not([hidden]) h2').waitFor();
 assert.equal(await page.locator('#detail h2').innerText(),'FD2');
 assert.match(await page.locator('.catalog-note').innerText(),/approved as FD1 in 2022.*renamed FD2 in 2025/);
 await page.screenshot({path:dir+'/saved-fd1-detail.png'});
 await page.locator('#closeDetail').click();

 // Reading never rewrites the row: no migration, and nothing to undo if this merge is ever reverted.
 assert.deepEqual(sql('SELECT mold_id FROM bag_discs').map(r=>r.mold_id),[FOLDED]);
 assert.deepEqual(h.errors,[]);
 console.log(`PASS: a bag row naming the folded ID resolves to FD2 in the list and detail. Screenshots: ${dir}.`);
}catch(error){console.error(h.logs());throw error;}finally{await h.stop();}
