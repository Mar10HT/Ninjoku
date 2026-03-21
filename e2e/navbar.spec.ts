import { test, expect } from '@playwright/test';

test.describe('Navbar', () => {
  test('appears on Classic page with logo, day counter, and ? button', async ({ page }) => {
    await page.goto('/classic');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeVisible();
    await expect(nav.getByText('NARUTODLE')).toBeVisible();
    await expect(nav.getByText(/Day #\d+/)).toBeVisible();
    await expect(nav.getByRole('button', { name: 'How to play' })).toBeVisible();
  });

  test('appears on Grid page', async ({ page }) => {
    await page.goto('/grid');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'How to play' })).toBeVisible();
  });

  test('appears on Pyramid page', async ({ page }) => {
    await page.goto('/pyramid');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'How to play' })).toBeVisible();
  });

  test('logo links back to home', async ({ page }) => {
    await page.goto('/classic');
    await page.getByRole('link', { name: 'NARUTODLE' }).click();
    await expect(page).toHaveURL('/');
  });
});
