import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkCatalogIdentity(browser, base) {
 const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
 const page = await context.newPage(), errors = [];
 const output = 'outputs/discmania-identity';
 fs.mkdirSync(output, {recursive: true});
 page.on('pageerror', error => errors.push(error.message));
 page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
 const capture = async name => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({path: `${output}/${name}.png`});
 };
 const choose = async id => {
  const row = page.locator(`.disc-row[data-id="${id}"]`);
  await row.focus(); await page.keyboard.press('Enter');
  await page.locator('#detail:not([hidden])').waitFor();
 };
 try {
  await page.goto(base);
  await page.waitForFunction(() => typeof discs !== 'undefined' && discs.length === 2434);
  await page.locator('#listTab').click();
  await page.locator('#search').fill('Discmania FD2');
  assert.equal(await page.locator('.disc-row[data-id="3bd98a3bc639"] strong').innerText(), 'FD2');
  assert.equal(await page.locator('.disc-row[data-id="3d70ef38ff0e"] strong').innerText(), 'FD2');
  await choose('3bd98a3bc639');
  assert.equal(await page.locator('#detail h2').innerText(), 'FD2');
  assert.equal(await page.locator('.approval-name').innerText(), 'PDGA record: FD1');
  assert.match(await page.locator('.catalog-note').innerText(), /renamed this mold the FD2 in mid-2025/);
  assert.match(await page.locator('.catalog-note').innerText(), /25-150.*separately/);
  assert.deepEqual(await page.locator('#detail .numbers strong').allTextContents(), ['7', '4', '0', '2']);
  assert.match(await page.locator('#flight svg').getAttribute('aria-label'), /FD2/);
  await capture('fd2-former-fd1-desktop');
  await page.locator('#compare').click();
  assert.equal(await page.locator('.compare-item strong').innerText(), 'FD2', 'Comparison uses the current name');
  await page.locator('#closeDetail').click();
  await choose('3d70ef38ff0e');
  assert.match(await page.locator('.approval-name').innerText(), /FD2 \(new\)/);
  assert.match(await page.locator('.catalog-note').innerText(), /22-211.*separate/);
  await capture('fd2-2025-approval-desktop');
  await page.locator('#closeDetail').click();
  await page.locator('#search').fill('Instinct');
  assert.equal(await page.locator('.disc-row[data-id="6d63e6972109"] strong').innerText(), 'FD1');
  await choose('6d63e6972109');
  assert.equal(await page.locator('#detail h2').innerText(), 'FD1');
  assert.match(await page.locator('.approval-name').innerText(), /Instinct/);
  assert.deepEqual(await page.locator('#detail .numbers strong').allTextContents(), ['7', '5', '0', '2']);
  await capture('fd1-former-instinct-desktop');
  await page.locator('#closeDetail').click();
  await page.locator('#search').fill('FD1');
  assert.equal(await page.locator('.disc-row[data-id="6d63e6972109"]').count(), 1, 'Current FD1 can be searched');
  assert.equal(await page.locator('.disc-row[data-id="3bd98a3bc639"]').count(), 1, 'Former FD1 remains searchable');
  for (const id of ['3bd98a3bc639', '6d63e6972109']) {
   await choose(id);
   for (const theme of ['light', 'midnight', 'charcoal']) {
    await page.evaluate(theme => applyTheme(theme), theme);
    for (const width of [1440, 360]) {
     await page.setViewportSize({width, height: width === 360 ? 800 : 1000});
     await page.locator('.catalog-note').scrollIntoViewIfNeeded();
     assert.ok(await page.locator('.catalog-note').isVisible());
     assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
     const box = await page.locator('.catalog-note').boundingBox();
     assert.ok(box.x >= 0 && box.x + box.width <= width, 'Rename note fits the viewport');
     await capture(`${id}-${width}-${theme}`);
    }
   }
   await page.locator('#closeDetail').click();
  }
  await choose('3bd98a3bc639');
  await page.evaluate(() => applyTheme('light'));
  await page.locator('#expandDetail').click();
  await page.locator('#detail').evaluate(node => {node.scrollTop = 0;});
  await capture('fd2-former-fd1-mobile-expanded');
  await page.locator('#closeDetail').click();
  await page.setViewportSize({width: 1440, height: 1000});
  await page.locator('#search').fill('Discmania');
  await page.locator('#mapTab').click();
  await page.waitForFunction(() => groupCache?.items === filtered && !regrouping);
  // Exercise the same group popover used by nearby-disc exploration, with the overlapping approvals.
  await page.evaluate(() => {
   const members = ['3bd98a3bc639', '3d70ef38ff0e', '6d63e6972109'].map(id => discs.find(d => d.id === id));
   openCluster({key: 'identity-qa', members}, document.querySelector('#map'), true);
  });
  assert.deepEqual(await page.locator('.cluster-disc strong').allTextContents(), ['FD2', 'FD2', 'FD1']);
  assert.deepEqual(await page.locator('.cluster-stat strong').allTextContents(), ['FD2', 'FD2', 'FD1']);
  await page.keyboard.press('Escape');
  // Existing saved bags retain approval IDs and pick up the current catalog labels on refresh.
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('atlas-account-change', {detail: {
   user: {name: 'Catalog QA', email: 'qa@example.invalid'}, bagReady: true,
   profile: {level: 'unknown', style: 'unknown'},
   bag: [{id: 'qa-old-fd1', discId: '3bd98a3bc639'}, {id: 'qa-instinct', discId: '6d63e6972109'}],
  }})));
  await page.locator('#bagTab').click();
  assert.deepEqual(await page.locator('.bag-disc-name strong').allTextContents(), ['FD2', 'FD1']);
  await page.locator('#bagSearch').fill('Instinct');
  assert.equal(await page.locator('[data-add-result="6d63e6972109"] strong').innerText(), 'FD1');
  assert.deepEqual(errors, []);
  console.log(`PASS: catalog names, separate approvals, rename notes, old-name search, keyboard selection, 3 themes at 1440/360px. Screenshots: ${output}.`);
 } finally {await context.close();}
}
