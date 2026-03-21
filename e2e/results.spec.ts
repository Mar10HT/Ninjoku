import { test, expect } from '@playwright/test';

// Helper: inject a finished Grid game state and navigate to trigger auto-redirect
async function injectGridWin(page: import('@playwright/test').Page, won = true) {
  const cells = Array(3).fill(null).map(() =>
    Array(3).fill({ status: won ? 'correct' : 'wrong', character: { id: 1, name: 'Test', image: '' }, rarity: 50 }),
  );
  await page.evaluate(
    ({ cells, won }) => {
      const today = new Date();
      const key = `narutodle_grid_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      localStorage.setItem(key, JSON.stringify({ cells, gameState: won ? 'won' : 'lost', wrongTotal: won ? 0 : 1 }));
    },
    { cells, won },
  );
}

async function injectPyramidFinished(page: import('@playwright/test').Page, score: number) {
  const cells = [
    [{ status: 'correct', score: score }],
    [{ status: 'wrong' }, { status: 'wrong' }],
    [{ status: 'pending' }, { status: 'pending' }, { status: 'pending' }],
    [{ status: 'pending' }, { status: 'pending' }, { status: 'pending' }, { status: 'pending' }],
  ];
  await page.evaluate(
    ({ cells, score }) => {
      const today = new Date();
      const key = `narutodle_pyramid_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      localStorage.setItem(key, JSON.stringify({ cells, totalScore: score, finished: true }));
    },
    { cells, score },
  );
}

test.describe('Results page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter(k => k.startsWith('narutodle_grid') || k.startsWith('narutodle_pyramid') || k.startsWith('narutodle_stats'))
        .forEach(k => localStorage.removeItem(k));
    });
  });

  test('redirects to home if accessed without state', async ({ page }) => {
    await page.goto('/results');
    await expect(page).toHaveURL('/');
  });

  test('Grid win: shows VICTORY, countdown, and share button', async ({ page }) => {
    await injectGridWin(page, true);
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await expect(page.getByText('VICTORY!')).toBeVisible();
    await expect(page.getByText(/Next challenge in/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'SHARE RESULT' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PLAY ANOTHER MODE' })).toBeVisible();
  });

  test('Grid loss: shows DEFEAT', async ({ page }) => {
    await injectGridWin(page, false);
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await expect(page.getByText('DEFEAT!')).toBeVisible();
  });

  test('countdown timer shows HH:MM:SS format', async ({ page }) => {
    await injectGridWin(page);
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    // Should show a valid time format immediately (no flash of 00:00:00)
    await expect(page.locator('.font-mono').filter({ hasText: /^\d{2}:\d{2}:\d{2}$/ })).toBeVisible();
  });

  test('PLAY ANOTHER MODE navigates to /play', async ({ page }) => {
    await injectGridWin(page);
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await page.getByRole('button', { name: 'PLAY ANOTHER MODE' }).click();
    await expect(page).toHaveURL('/play');
  });

  test('SHARE RESULT copies text to clipboard', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await injectGridWin(page);
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await page.getByRole('button', { name: 'SHARE RESULT' }).click();
    await expect(page.getByRole('button', { name: 'COPIED!' })).toBeVisible();
  });

  test('Grid win: shows Your grid visual summary', async ({ page }) => {
    await injectGridWin(page, false);
    // Inject specific cells for visual test
    await page.evaluate(() => {
      const today = new Date();
      const key = `narutodle_grid_${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const cells = Array(3).fill(null).map(() => Array(3).fill({ status: 'empty' }));
      cells[0][0] = { status: 'correct', character: { id: 1, name: 'Test' }, rarity: 10 };
      cells[0][1] = { status: 'wrong' };
      localStorage.setItem(key, JSON.stringify({ cells, gameState: 'lost', wrongTotal: 1 }));
    });
    await page.goto('/grid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await expect(page.getByText('Your grid')).toBeVisible();
    // 9 cells in the visual summary grid
    const summaryCells = page.locator('main .grid-cols-3 > div');
    await expect(summaryCells).toHaveCount(9);
  });

  test('Pyramid: shows Your pyramid visual summary with score', async ({ page }) => {
    await injectPyramidFinished(page, 180);
    await page.goto('/pyramid');
    await expect(page).toHaveURL('/results', { timeout: 5000 });
    await expect(page.getByText('Your pyramid')).toBeVisible();
    await expect(page.getByText('180 pts total')).toBeVisible();
  });
});
