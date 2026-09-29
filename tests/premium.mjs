import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkPremium(browser, base) {
  const context = await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
  const page = await context.newPage(), errors=[];
  page.on('pageerror', error=>errors.push(error.message));
  try {
    await page.goto(base);
    await page.locator('.atlas-marker.is-selected').waitFor();
    await page.mouse.move(650,350);
    const before = await page.evaluate(()=>({zoom,...pan}));
    await page.mouse.wheel(0,-120);
    await page.waitForTimeout(250);
    const after = await page.evaluate(()=>({zoom,...pan}));
    assert.ok(after.zoom>before.zoom,'An ordinary mouse wheel zooms in');
    const anchor = await page.evaluate(()=>{
      const area=AtlasLayout.bounds(canvas.clientWidth,canvas.clientHeight), rect=canvas.getBoundingClientRect();
      return {x:650-rect.left-area.left,y:350-rect.top-area.bottom};
    });
    assert.ok(Math.abs((anchor.x-before.x)/before.zoom-(anchor.x-after.x)/after.zoom)<.01,'The cursor holds the same horizontal world coordinate');
    assert.ok(Math.abs((anchor.y-before.y)/before.zoom-(anchor.y-after.y)/after.zoom)<.01,'The cursor holds the same vertical world coordinate');
    await page.locator('#map').dispatchEvent('wheel',{deltaY:12,deltaX:0,deltaMode:0});
    await page.waitForTimeout(200);
    const dragged=await page.evaluate(()=>({zoom,...pan}));
    assert.equal(dragged.zoom,after.zoom,'Fine two-finger trackpad motion pans');
    assert.ok(dragged.y<after.y,'A vertical trackpad drag moves the camera');
    await page.locator('#map').dispatchEvent('wheel',{deltaY:-12,ctrlKey:true});
    await page.waitForTimeout(250);
    assert.ok(await page.evaluate(z=>zoom>z,after.zoom),'Trackpad pinch still zooms');
    const pinchZoom=await page.evaluate(()=>zoom);
    await page.locator('#map').dispatchEvent('wheel',{deltaY:3,deltaMode:1});
    await page.waitForTimeout(250);
    assert.ok(await page.evaluate(z=>zoom<z,pinchZoom),'Line-mode mouse wheels zoom out');
    await page.getByRole('button',{name:'Switch to dark mode'}).click();
    await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'midnight','Theme toggle persists');
    fs.mkdirSync('outputs/premium',{recursive:true});
    await page.waitForTimeout(400);
    await page.screenshot({path:'outputs/premium/dark.png'});
    await page.getByRole('button',{name:'Switch to light mode'}).click();
    await page.waitForTimeout(400);
    await page.screenshot({path:'outputs/premium/light.png'});
    for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844},{width:320,height:640}]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(250);
      const dock=await page.locator('.graph-dock').boundingBox(),controls=await page.locator('.map-controls').boundingBox(),coach=await page.locator('#coachButton').boundingBox();
      const separate=(a,b)=>a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y;
      assert.ok(separate(controls,coach),'Zoom controls and coach do not overlap');
      assert.ok(separate(dock,controls),'Graph legend and zoom controls do not overlap');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      await page.locator('#atlasInfo summary').click();
      assert.ok(await page.locator('#atlasInfo a[href="/privacy.html"]').isVisible(),'Legal links are reachable in the information menu');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#atlasInfo').getAttribute('open'),null,'Escape closes the information menu');
      await page.evaluate(()=>{
        const group=mapClusters.at(-1);openCluster(group,markerNodes.get(group.key),true);
      });
      const preview=await page.locator('#clusterPopover').boundingBox();
      assert.ok(separate(preview,controls)&&separate(preview,coach),'Disc previews reserve space for both zoom and coach controls');
      await page.keyboard.press('Escape');
      await page.screenshot({path:`outputs/premium/light-${viewport.width}.png`});
    }
    await page.setViewportSize({width:1440,height:900});
    await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween);
    await page.waitForTimeout(250);
    await page.screenshot({path:'outputs/premium/overview.png'});
    await page.setViewportSize({width:390,height:844});
    await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();
    const cdp=await context.newCDPSession(page),touchZoom=await page.evaluate(()=>zoom);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:140,y:400,id:1},{x:240,y:400,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:110,y:400,id:1},{x:270,y:400,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(200);
    assert.ok(await page.evaluate(z=>zoom>z,touchZoom),'Two-finger touch pinch still zooms');
    assert.deepEqual(errors,[]);
    console.log('PASS: cursor-centered wheel zoom, trackpad pan/pinch, touch pinch, line-mode wheel, saved theme, responsive chrome, preview clearance and information menu.');
  } finally { await context.close(); }
}
