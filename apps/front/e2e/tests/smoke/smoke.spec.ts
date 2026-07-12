import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchSidebarMock } from '../mocks/api/blog-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';

test.describe('smoke: アプリ起動・主要ルート疎通確認', () => {
    test('N-1: トップページ（未認証）が表示される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
        ]);

        await page.goto('/');

        await expect(page.getByRole('heading', { name: 'Test Blog 1', exact: true }).first()).toBeVisible();
    });

    test('N-2: ログインページが表示される', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByLabel('メールアドレス')).toBeVisible();
    });

    test('N-3: トップページでコンソールエラーが出ない', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Test Blog 1', exact: true }).first()).toBeVisible();

        // 401（未認証時の想定内レスポンス）は除外し、それ以外の致命的エラーがないことを確認
        const criticalErrors = consoleErrors.filter(
            (msg) => !msg.includes('401') && !msg.includes('Unauthorized'),
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('S-1: 存在しないページにアクセスしてもクラッシュしない', async ({ page }) => {
        const response = await page.goto('/no-such-page-xyz');

        expect([200, 404]).toContain(response?.status());
        await expect(page.locator('body')).toBeVisible();
    });
});
