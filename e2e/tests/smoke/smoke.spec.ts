import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../mocks/api/blog-api-mock';
import { mockBlogs } from '../mocks/blog/blog-mock';

test.describe('smoke: アプリ起動・主要ルート疎通確認', () => {
    test('N-1: トップページ（未認証）が表示される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
        ]);

        await page.goto('/');

        await expect(page.getByText('Test Blog 1')).toBeVisible();
    });

    test('N-2: ログインページが表示される', async ({ page }) => {
        await page.goto('/login');

        await expect(page.getByRole('textbox', { name: /メール|email/i })).toBeVisible();
    });

    test('N-3: トップページでコンソールエラーが出ない', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
        ]);

        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');
        await expect(page.getByText('Test Blog 1')).toBeVisible();

        expect(consoleErrors).toHaveLength(0);
    });

    test('S-1: 存在しないページにアクセスしてもクラッシュしない', async ({ page }) => {
        const response = await page.goto('/no-such-page-xyz');

        expect([200, 404]).toContain(response?.status());
        await expect(page.locator('body')).toBeVisible();
    });
});
