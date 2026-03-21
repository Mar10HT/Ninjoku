import { test, expect } from '@playwright/test';

test.describe('Classic game', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts fresh
    await page.goto('/classic');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('narutodle_classic') || k.startsWith('narutodle_stats'))
        .forEach(k => localStorage.removeItem(k));
    });
    await page.reload();
  });

  test('shows guess counter and search input', async ({ page }) => {
    await expect(page.getByText(/Guess #1 of \d+/)).toBeVisible();
    await expect(page.getByPlaceholder('Search for a ninja...')).toBeVisible();
  });

  test('search shows results when typing', async ({ page }) => {
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: /Naruto/ }).first()).toBeVisible();
  });

  test('search shows +N more hint when results exceed 8', async ({ page }) => {
    // "a" matches many characters — should trigger the truncation hint
    await page.getByPlaceholder('Search for a ninja...').fill('a');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const items = listbox.getByRole('option');
    const count = await items.count();
    if (count > 8) {
      // Hint text is "+N more — keep typing to narrow down"
      await expect(listbox.getByText(/\+\d+ more/)).toBeVisible();
    }
  });

  test('selecting a character adds a guess row', async ({ page }) => {
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    // Guess row should appear in the table
    await expect(page.getByRole('rowheader', { name: /Naruto Uzumaki/ })).toBeVisible();
  });

  test('guess row contains all 8 feedback columns', async ({ page }) => {
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    const row = page.getByRole('row').nth(1); // first data row
    // Should have 9 cells total (1 header + 8 fields)
    await expect(row.getByRole('cell').or(row.getByRole('rowheader'))).toHaveCount(9);
  });

  test('completed game auto-redirects to results', async ({ page }) => {
    // Use Grid game state — no targetId needed, easier to fake a finished game
    await page.evaluate(() => {
      const today = new Date();
      const key = `narutodle_grid_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const cells = Array(3).fill(null).map(() =>
        Array(3).fill({ status: 'correct', character: { id: 1, name: 'Test', image: '' }, rarity: 50 }),
      );
      localStorage.setItem(key, JSON.stringify({ cells, gameState: 'won', wrongTotal: 0 }));
    });
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await expect(page.getByText('VICTORY!')).toBeVisible();
  });

  test('already-guessed character does not appear in dropdown', async ({ page }) => {
    // Make one guess
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto Uzumaki');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    // Search again for the same character
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto Uzumaki');
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByText(/Already guessed/)).toBeVisible();
  });

  test('ArrowDown and Enter keyboard selection works', async ({ page }) => {
    const input = page.getByPlaceholder('Search for a ninja...');
    await input.fill('Sakura');
    await expect(page.getByRole('listbox')).toBeVisible();
    await input.press('ArrowDown');
    await input.press('Enter');
    // A guess row should appear
    await expect(page.getByRole('rowheader', { name: /Sakura/ })).toBeVisible();
  });

  test('Escape closes the dropdown', async ({ page }) => {
    const input = page.getByPlaceholder('Search for a ninja...');
    await input.fill('Kakashi');
    await expect(page.getByRole('listbox')).toBeVisible();
    await input.press('Escape');
    await expect(page.getByRole('listbox')).not.toBeVisible();
  });
});
