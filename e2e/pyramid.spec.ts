import { test, expect } from '@playwright/test';

test.describe('Pyramid game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pyramid');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('narutodle_pyramid'))
        .forEach(k => localStorage.removeItem(k));
    });
    await page.reload();
  });

  test('renders pyramid with 10 cells', async ({ page }) => {
    const cells = page.getByRole('button', { name: /cell/i });
    await expect(cells).toHaveCount(10);
  });

  test('shows 4 criterion labels (one per row)', async ({ page }) => {
    // Each row has a rounded-full label badge
    const labels = page.locator('.rounded-full').filter({ hasText: /\+\d+/ });
    await expect(labels).toHaveCount(4);
  });

  test('shows score and guesses left', async ({ page }) => {
    await expect(page.getByText(/Score:/)).toBeVisible();
    await expect(page.getByText(/Guesses:.*10.*left/)).toBeVisible();
  });

  test('clicking a pending cell activates it and shows search', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    await expect(page.getByRole('button', { name: 'Active cell — type to search' })).toBeVisible();
    await expect(page.getByPlaceholder('Search for a ninja...')).toBeVisible();
  });

  test('selecting a character shows confirm dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    const input = page.getByPlaceholder('Search for a ninja...');
    await input.fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    // Confirm dialog should appear
    await expect(page.getByRole('button', { name: 'CONFIRM' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'CANCEL' })).toBeVisible();
    await expect(page.getByText('This guess is permanent.')).toBeVisible();
  });

  test('cancel in confirm dialog returns to search', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    await page.getByRole('button', { name: 'CANCEL' }).click();
    // Should go back to search state
    await expect(page.getByPlaceholder('Search for a ninja...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'CONFIRM' })).not.toBeVisible();
  });

  test('confirming a guess places character in cell', async ({ page }) => {
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    await page.getByRole('button', { name: 'CONFIRM' }).click();
    // One guess is now used
    await expect(page.getByText(/Guesses:.*9.*left/)).toBeVisible();
  });

  test('clicking different cell resets pending guess', async ({ page }) => {
    // Activate first cell
    const cells = page.getByRole('button', { name: 'Pending cell — click to guess' });
    await cells.first().click();
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    // Now click a different cell (should cancel pending)
    await cells.nth(1).click();
    await expect(page.getByRole('button', { name: 'CONFIRM' })).not.toBeVisible();
    await expect(page.getByPlaceholder('Search for a ninja...')).toBeVisible();
  });

  test('used characters are excluded from future searches', async ({ page }) => {
    // Place Naruto Uzumaki
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto Uzumaki');
    await page.getByRole('option', { name: /Naruto Uzumaki/ }).first().click();
    await page.getByRole('button', { name: 'CONFIRM' }).click();
    // Now try to search for Naruto Uzumaki again in the next cell
    await page.getByRole('button', { name: 'Pending cell — click to guess' }).first().click();
    await page.getByPlaceholder('Search for a ninja...').fill('Naruto Uzumaki');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    // Should show "Already guessed" instead of Naruto Uzumaki
    await expect(listbox.getByText('Already guessed')).toBeVisible();
  });

  test('Navbar ? button opens modal with Pyramid tab', async ({ page }) => {
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Pyramid' })).toHaveAttribute('aria-selected', 'true');
  });
});
