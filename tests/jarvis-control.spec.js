const { test, expect } = require('@playwright/test');

async function unlockSystem(page) {
  await page.goto('http://localhost:8000');
  await page.locator('#lockPassword').fill('77346244');
  await page.locator('#lockSubmit').click();
  await expect(page.locator('#hud')).toBeVisible();
}

test.describe('JARVIS MK3 controls and validation', () => {
  test('lockscreen is visible and blocks HUD before unlock', async ({ page }) => {
    await page.goto('http://localhost:8000');

    await expect(page.locator('#lockscreen')).toBeVisible();
    await expect(page.locator('#hud')).toBeHidden();
    await expect(page.locator('#lockPassword')).toBeVisible();
  });

  test('wrong master code keeps the system locked', async ({ page }) => {
    await page.goto('http://localhost:8000');

    await page.locator('#lockPassword').fill('00000000');
    await page.locator('#lockSubmit').click();

    await expect(page.locator('#lockError')).toContainText('Neplatný kód');
    await expect(page.locator('#hud')).toBeHidden();
  });

  test('correct master code unlocks the full HUD', async ({ page }) => {
    await unlockSystem(page);

    await expect(page.locator('#status')).toContainText('Čakám na príkaz');
    await expect(page.locator('#systemStats')).toContainText('SYS');
    await expect(page.locator('#holo-input')).toBeVisible();
    await expect(page.locator('#holo-keyboard')).toBeVisible();
  });

  test('status command updates the system log and mood state', async ({ page }) => {
    await unlockSystem(page);

    await page.locator('#holo-input').fill('status');
    await page.locator('#holo-input').press('Enter');

    await expect(page.locator('#log')).toContainText('Systém online');
    await expect(page.locator('#moodValue')).toContainText('CALM');
  });

  test('weather command changes the weather value', async ({ page }) => {
    await unlockSystem(page);

    const before = await page.locator('#weatherValue').textContent();
    await page.locator('#holo-input').fill('weather');
    await page.locator('#holo-input').press('Enter');

    await expect(page.locator('#weatherValue')).not.toHaveText(before || '');
  });

  test('scan command updates threat state and displays the audit result', async ({ page }) => {
    await unlockSystem(page);

    await page.locator('#holo-input').fill('scan');
    await page.locator('#holo-input').press('Enter');

    await expect(page.locator('#log')).toContainText('Skenujem sieť');
    await expect(page.locator('#networkState')).toContainText('SCANNING');
  });

  test('toolkit buttons execute core command actions', async ({ page }) => {
    await unlockSystem(page);

    const buttons = [
      { selector: 'button[data-command="audit"]', input: 'security audit example.com' },
      { selector: 'button[data-command="hash"]', input: 'hash sha-256 jarvis' },
      { selector: 'button[data-command="dns"]', input: 'dns example.com' },
      { selector: 'button[data-command="password"]', input: 'password test123' }
    ];

    for (const item of buttons) {
      await page.locator(item.selector).click();
      await expect(page.locator('#log')).toContainText(item.input.split(' ')[0]);
    }
  });

  test('virtual keyboard can input text and execute commands', async ({ page }) => {
    await unlockSystem(page);

    await page.locator('.key[data-value="S"]').click();
    await page.locator('.key[data-value="T"]').click();
    await page.locator('.key[data-value="A"]').click();
    await page.locator('.key[data-value="T"]').click();
    await page.locator('.key[data-value="U"]').click();
    await page.locator('.key[data-value="S"]').click();

    await page.locator('.key[data-action="enter"]').click();

    await expect(page.locator('#log')).toContainText('TY: STATUS');
  });

  test('voice button is rendered in the right panel', async ({ page }) => {
    await unlockSystem(page);

    await expect(page.locator('.voice-toggle')).toBeVisible();
    await expect(page.locator('.voice-toggle')).toContainText('VOICE');
  });
});
