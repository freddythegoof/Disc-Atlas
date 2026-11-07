import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkCatalogIdentity(browser, base) {
 const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1440, height: 1000}});
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
  await page.waitForFunction(() => typeof discs !== 'undefined' && discs.length === 2433);
  await page.locator('#listTab').click();
  await page.locator('#search').fill('Discmania FD2');
  assert.deepEqual(await page.locator('.disc-row').evaluateAll(rows => rows.map(row => row.dataset.id)), ['3d70ef38ff0e'], 'Directory shows one disc for this mold');
  assert.equal(await page.locator('.disc-row[data-id="3d70ef38ff0e"] strong').innerText(), 'FD2');
  await choose('3d70ef38ff0e');
  assert.equal(await page.locator('#detail h2').innerText(), 'FD2');
  assert.match(await page.locator('.approval-name').innerText(), /FD2 \(new\)/);
  const note = await page.locator('.catalog-note').innerText();
  assert.match(note, /approved as FD1 in 2022.*22-211.*Nov 28, 2022.*renamed FD2 in 2025.*25-150.*Sep 29, 2025/);
  assert.deepEqual(await page.locator('#detail .numbers strong').allTextContents(), ['7', '4', '0', '2']);
  assert.match(await page.locator('#flight svg').getAttribute('aria-label'), /FD2/);
  await capture('fd2-combined-desktop');
  await page.locator('#compare').click();
  assert.equal(await page.locator('.compare-item strong').innerText(), 'FD2', 'Comparison uses the current name');
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
  assert.equal(await page.locator('.disc-row[data-id="3d70ef38ff0e"]').count(), 1, 'Former FD1 lands on the combined disc');
  assert.equal(await page.locator('.disc-row[data-id="3bd98a3bc639"]').count(), 0, 'The folded record is gone');
  for (const id of ['3d70ef38ff0e', '6d63e6972109']) {
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
  await page.evaluate(() => applyTheme('light'));
  await page.setViewportSize({width: 1440, height: 1000});
  // The map draws one position for this mold, and the featured list follows the surviving record.
  await page.locator('#search').fill('Discmania FD2');
  await page.locator('#mapTab').click();
  await page.waitForFunction(() => groupCache?.items === filtered && !regrouping);
  assert.deepEqual(await page.evaluate(() => [...atlasPositions.keys()].filter(id => ['3bd98a3bc639', '3d70ef38ff0e'].includes(id))), ['3d70ef38ff0e']);
  assert.deepEqual(await page.evaluate(() => filtered.filter(d => d.speed != null).map(d => d.id)), ['3d70ef38ff0e'], 'Map shows one disc for this mold');
  assert.ok(await page.evaluate(() => {
   const ids = window.DiscAtlasFeatured.map(d => d.id);
   return ids.includes('3d70ef38ff0e') && !ids.includes('3bd98a3bc639');
  }), 'Featured list names the surviving record');
  assert.deepEqual(errors, []);
  console.log(`PASS: combined FD2, rename note, old-name search, keyboard selection, one map position, 3 themes at 1440/360px. Screenshots: ${output}.`);
 } finally {await context.close();}
}
