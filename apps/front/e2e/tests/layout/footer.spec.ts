import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';

test.describe('Footer (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
    });

    test('Footer is displayed (unauthenticated)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // サイト概要
        await expect(page.getByText('サイト概要')).toBeVisible();
        await expect(page.getByText('TechBlogは、')).toBeVisible();

        // Copyright
        await expect(page.getByText(`© ${new Date().getFullYear()} TechBlog`)).toBeVisible();
    });
});
