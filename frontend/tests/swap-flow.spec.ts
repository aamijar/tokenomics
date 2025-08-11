import { test, expect } from '@playwright/test';

test('Swap: quote then approve-gated swap button', async ({ page }) => {
  await page.goto('/');
  const swapTab = page.getByRole('link', { name: /swap/i });
  if (await swapTab.isVisible().catch(() => false)) {
    await swapTab.click();
  } else {
    await page.goto('/swap');
  }

  await expect(page.getByRole('heading', { name: /swap/i })).toBeVisible();

  const amount = page.getByPlaceholder('0.0');
  await amount.fill('100');

  const getQuote = page.getByRole('button', { name: /get quote/i });
  await getQuote.click();

  await expect(page.getByText(/Estimated Output/i)).toBeVisible({ timeout: 15000 });

  const approveBtn = page.getByRole('button', { name: /approve|approved/i });
  await expect(approveBtn).toBeVisible();

  const swapBtn = page.getByRole('button', { name: /prepare swap|execute swap/i });
  await expect(swapBtn).toBeVisible();
});
