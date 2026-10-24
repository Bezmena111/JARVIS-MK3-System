const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:8000');

  const lockscreenVisible = await page.locator('#lockscreen').isVisible();
  if (!lockscreenVisible) {
    throw new Error('Lockscreen is not visible on initial load');
  }

  await page.locator('#lockPassword').fill('77346244');
  await page.locator('#lockSubmit').click();

  await page.waitForTimeout(800);

  const hudVisible = await page.locator('#hud').isVisible();
  if (!hudVisible) {
    throw new Error('HUD did not unlock with the correct master code');
  }

  const lockscreenHidden = await page.locator('#lockscreen').evaluate((el) => {
    return window.getComputedStyle(el).visibility === 'hidden' || el.classList.contains('hidden');
  });

  if (!lockscreenHidden) {
    throw new Error('Lockscreen remained visible after unlock');
  }

  await page.locator('#holo-input').fill('status');
  await page.locator('#holo-input').press('Enter');

  await page.waitForTimeout(300);

  const logText = await page.locator('#log').textContent();
  if (!logText.includes('Systém online') && !logText.includes('TY: status')) {
    throw new Error('Status command did not log output');
  }

  const weatherBefore = await page.locator('#weatherValue').textContent();
  await page.locator('#holo-input').fill('weather');
  await page.locator('#holo-input').press('Enter');
  await page.waitForTimeout(200);

  const weatherAfter = await page.locator('#weatherValue').textContent();
  if (weatherBefore === weatherAfter) {
    throw new Error('Weather command did not update the displayed weather');
  }

  console.log('Smoke test passed: lockscreen unlock works, HUD renders, and status/weather commands execute.');
  await browser.close();
})();
