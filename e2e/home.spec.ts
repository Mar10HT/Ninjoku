import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders logo and badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'NARUTODLE' })).toBeVisible();
    await expect(page.getByText(/DAILY CHALLENGE #/)).toBeVisible();
  });

  test('renders CTA buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: "PLAY TODAY'S CHALLENGE" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'HOW TO PLAY' })).toBeVisible();
  });

  test('stats section is visible', async ({ page }) => {
    // With no games played, shows fallback day counter
    await expect(page.getByText('Current day').or(page.getByText('CLASSIC'))).toBeVisible();
  });

  test('HOW TO PLAY opens the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How to Play' })).toBeVisible();
  });

  test('modal closes with X button', async ({ page }) => {
    await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('modal closes with Escape key', async ({ page }) => {
    await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('PLAY button navigates to mode select', async ({ page }) => {
    await page.getByRole('button', { name: "PLAY TODAY'S CHALLENGE" }).click();
    await expect(page).toHaveURL('/play');
  });
});
