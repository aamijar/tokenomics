import { test, expect } from '@playwright/test';

test('Markets loads and navigates to Token page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /markets/i })).toBeVisible({ timeout: 15000 });

  const rows = page.locator('table tbody tr');
  if (await rows.count()) {
    await rows.nth(0).click();
    await expect(page).toHaveURL(/\/token\//);
    await expect(page.getByText(/Price Chart/i)).toBeVisible();
  }
});
