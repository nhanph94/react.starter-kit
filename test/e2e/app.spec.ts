import { expect, test } from '@playwright/test';

test.describe('application shell', () => {
  test('renders the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('React / Starter KIT');
  });

  test('returns metadata in the initial HTML response', async ({ page }) => {
    const response = await page.goto('/');

    expect(await response?.text()).toContain('<title>React / Starter KIT</title>');
    expect(await response?.text()).toContain('name="description"');
    expect(await response?.text()).toContain('property="og:title"');
    expect(await response?.text()).toContain('name="twitter:description"');
    expect(await response?.text()).toContain('const themeNames = new Set(["light","night"])');

    await expect(page).toHaveTitle('React / Starter KIT');
    await expect(page.locator('head > meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head > meta[property="og:title"]')).toHaveCount(1);
  });

  test('boots without runtime errors', async ({ page }) => {
    const runtimeErrors: Error[] = [];
    page.on('pageerror', (error) => {
      runtimeErrors.push(error);
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    expect(runtimeErrors).toEqual([]);
  });
});
