import { test, expect } from '@playwright/test';

test.describe('Mode Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play');
  });

  test('shows all three mode cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'CLASSIC' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'GRID' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PYRAMID' })).toBeVisible();
  });

  test('Classic card has RECOMMENDED badge', async ({ page }) => {
    await expect(page.getByText('RECOMMENDED')).toBeVisible();
  });

  test('Pyramid card has PRO MODE ONLY badge', async ({ page }) => {
    await expect(page.getByText('PRO MODE ONLY', { exact: true })).toBeVisible();
  });

  test('difficulty toggle switches between Casual and Pro', async ({ page }) => {
    const casualBtn = page.getByRole('button', { name: 'casual' }).first();
    const proBtn = page.getByRole('button', { name: 'pro' }).first();
    await expect(casualBtn).toHaveAttribute('aria-pressed', 'true');
    await proBtn.click();
    await expect(proBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(casualBtn).toHaveAttribute('aria-pressed', 'false');
  });

  test('Play Classic navigates to /classic', async ({ page }) => {
    await page.getByRole('button', { name: 'Play CLASSIC' }).click();
    await expect(page).toHaveURL('/classic');
  });

  test('Play Grid navigates to /grid', async ({ page }) => {
    await page.getByRole('button', { name: 'Play GRID' }).click();
    await expect(page).toHaveURL('/grid');
  });

  test('Play Pyramid navigates to /pyramid', async ({ page }) => {
    await page.getByRole('button', { name: 'Play PYRAMID' }).click();
    await expect(page).toHaveURL('/pyramid');
  });

  test('Back button returns to home', async ({ page }) => {
    await page.getByRole('button', { name: '← Back' }).click();
    await expect(page).toHaveURL('/');
  });
});
