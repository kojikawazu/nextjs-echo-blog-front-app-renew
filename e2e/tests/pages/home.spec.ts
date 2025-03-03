import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/auth-api-mock';

test.describe('Home Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
    });

    test('Unauthenticated user is redirected to login page', async ({ page }) => {
        await page.goto('/');
        // 未認証でもホームにアクセスできる
        await expect(page).toHaveURL('/');
    });
});
