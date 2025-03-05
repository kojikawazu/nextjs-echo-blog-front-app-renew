import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../mocks/api/blog-api-mock';
import { mockBlogs } from '../mocks/blog/blog-mock';

test.describe('Home Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: true }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
        ]);
    });

    test('Authenticated user can see the latest articles', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 記事一覧が表示されていることを確認
        await expect(page.getByRole('link', { name: 'Test Blog 1', exact: true })).toBeVisible();
    });
});
