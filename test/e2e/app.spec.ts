import { expect, test } from '@playwright/test';

test.describe('application shell', () => {
  test('renders the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('React / Starter KIT');
  });

  test('sets the document title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('react.starter-kit');
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
