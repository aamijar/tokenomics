import { test, expect } from '@playwright/test';

test('Activity and Pools render with filters', async ({ page }) => {
  await page.goto('/activity');
  await expect(page.getByRole('heading', { name: /activity/i })).toBeVisible();
  await expect(page.locator('table')).toBeVisible();

  await page.goto('/pools');
  await expect(page.getByRole('heading', { name: /pools/i })).toBeVisible();
  await expect(page.locator('table')).toBeVisible();
});
