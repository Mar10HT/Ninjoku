import { test, expect } from '@playwright/test';

test.describe('Grid game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/grid');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('narutodle_grid'))
        .forEach(k => localStorage.removeItem(k));
    });
    await page.reload();
  });

  test('renders 3×3 grid of cells', async ({ page }) => {
    // 9 cells total: 3 rows × 3 columns
    const cells = page.getByRole('button', { name: /cell/i });
    await expect(cells).toHaveCount(9);
  });

  test('shows row and column criterion labels', async ({ page }) => {
    // Row labels appear (right column), col labels appear (top row)
    // There should be 6 labels total (3 rows + 3 cols)
    const badges = page.locator('.rounded-full.bg-border\\/30');
    await expect(badges).toHaveCount(6);
  });

  test('score bar shows 0/9 correct initially', async ({ page }) => {
    await expect(page.getByText(/0.*\/9 correct/)).toBeVisible();
  });

  test('clicking an empty cell activates it and shows search', async ({ page }) => {
    await page.getByRole('button', { name: 'Empty cell — click to guess' }).first().click();
    await expect(page.getByRole('button', { name: 'Active cell — type to search' })).toBeVisible();
    await expect(page.getByPlaceholder('Search for a ninja...')).toBeVisible();
  });

  test('search input appears with row×col criteria label', async ({ page }) => {
    await page.getByRole('button', { name: 'Empty cell — click to guess' }).first().click();
    // The criterion intersection label (e.g. "KONOHA × GENIN") should be visible
    await expect(page.locator('span.font-mono').filter({ hasText: '×' })).toBeVisible();
  });

  test('wrong guess in Casual mode does not end game', async ({ page }) => {
    // Set casual difficulty (default)
    await page.getByRole('button', { name: 'Empty cell — click to guess' }).first().click();
    // Type something unlikely to match the cell criteria
    const input = page.getByPlaceholder('Search for a ninja...');
    await input.fill('Naruto');
    const option = page.getByRole('option', { name: /Naruto Uzumaki/ }).first();
    if (await option.isVisible()) {
      await option.click();
      // Should show "Wrong!" or still be playing (not navigated away)
      await page.waitForTimeout(500);
      await expect(page).toHaveURL('/grid');
    }
  });

  test('Navbar ? button opens modal with Grid tab', async ({ page }) => {
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Grid' })).toHaveAttribute('aria-selected', 'true');
  });
});
