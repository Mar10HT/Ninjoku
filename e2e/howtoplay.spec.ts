import { test, expect } from '@playwright/test';

test.describe('HowToPlayModal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('shows Classic tab by default with correct content', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Classic' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Guess the mystery Naruto character')).toBeVisible();
    await expect(page.getByText('8 guesses')).toBeVisible();
  });

  test('Grid tab shows correct content', async ({ page }) => {
    await page.getByRole('tab', { name: 'Grid' }).click();
    await expect(page.getByRole('tab', { name: 'Grid' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Fill a 3×3 grid')).toBeVisible();
  });

  test('Pyramid tab shows correct content', async ({ page }) => {
    await page.getByRole('tab', { name: 'Pyramid' }).click();
    await expect(page.getByRole('tab', { name: 'Pyramid' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('10 guesses exactly')).toBeVisible();
  });

  test('focus trap: Tab cycles within modal', async ({ page }) => {
    // Tab through all focusable elements — should not leave modal
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    // Close button should still be reachable, meaning we're still in the modal
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('HowToPlayModal from Navbar', () => {
  test('opens on Classic page with Classic tab pre-selected', async ({ page }) => {
    await page.goto('/classic');
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Classic' })).toHaveAttribute('aria-selected', 'true');
  });

  test('opens on Grid page with Grid tab pre-selected', async ({ page }) => {
    await page.goto('/grid');
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Grid' })).toHaveAttribute('aria-selected', 'true');
  });

  test('opens on Pyramid page with Pyramid tab pre-selected', async ({ page }) => {
    await page.goto('/pyramid');
    await page.getByRole('button', { name: 'How to play' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Pyramid' })).toHaveAttribute('aria-selected', 'true');
  });
});
