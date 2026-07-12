import { test, expect } from '@playwright/test';

// 動作確認用のe2eテスト
test('Top page is displayed', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
});
