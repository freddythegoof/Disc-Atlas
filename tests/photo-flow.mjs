// The photo adder rework (docs/photo-adder-rework.md) for suites about something else. Choosing a photo now opens the
// aligner fitted to its rim, and Use photo makes the game asset in the sheet. Two steps keep a suite's own premise:
//   frameByHand(page)   · today's aligner, at its own default framing ("Frame it by hand instead", or the aligner's
//                         own refusal), for suites that compare a photo's bytes or pixels with main's, or pin the hand
//                         aligner's arithmetic;
//   keepPhotoLook(page) · the new photo saved wearing Photo, as every photo was saved before, for suites whose premise
//                         is a saved photo (the one-click make from it, the Photo look's output).
// Both are no-ops on a tree from before the rework (identity probes run the same steps in a baseline checkout).
const ALIGNER='dialog.photo-aligner';
export async function frameByHand(page,scope=page){
 if(!await scope.locator(ALIGNER+' .photo-aligner-manual').count())return;
 await page.waitForFunction(a=>['fitted','manual'].includes(document.querySelector(a)?.dataset.fit),ALIGNER,{timeout:90000});
 if(await scope.locator(ALIGNER+'[data-fit="fitted"] .photo-aligner-manual').count())await scope.locator(ALIGNER+' .photo-aligner-manual').click();
 await page.waitForFunction(a=>document.querySelector(a)?.dataset.fit==='manual',ALIGNER);
}
export async function keepPhotoLook(page,scope=page){
 // Only a new photo has a game asset made in the sheet (its preview showing); a levelled one keeps its look.
 if(!await scope.locator('#addDiscDialog .bag-photo-preview').isVisible().catch(()=>false))return;
 const row=scope.locator('#addDiscDialog .bag-photo-look');
 await row.waitFor({state:'visible'});
 await row.locator('label',{hasText:'Photo'}).click();
 await page.waitForFunction(()=>document.querySelector('#addDiscDialog .bag-photo-look input[value="photo"]')?.checked);
}
