import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

test.describe('カテゴリーページ', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);
    });

    test('N-1: カテゴリーページが表示される', async ({ page }) => {
        await page.goto('/category/Test%20Category');
        await page.waitForSelector('h2', { timeout: 20000 });

        await expect(page.getByRole('heading', { name: 'Test Blog 1', exact: true }).first()).toBeVisible();
    });

    test('N-2: カテゴリーページにブログ一覧が表示される', async ({ page }) => {
        await page.goto('/category/Test%20Category');
        await page.waitForSelector('h2', { timeout: 20000 });

        // 記事カードが表示されている
        await expect(page.getByRole('heading', { name: 'Test Blog 1', exact: true }).first()).toBeVisible();
    });

    test('N-3: サイドバーが表示される', async ({ page }) => {
        await page.goto('/category/Test%20Category');
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        await expect(page.getByRole('heading', { name: 'カテゴリー' })).toBeVisible();
        await expect(page.getByRole('heading', { name: '人気記事' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'タグ' })).toBeVisible();
    });

    test('S-1: 存在しないカテゴリーにアクセスしてもクラッシュしない', async ({ page }) => {
        await setupFetchBlogsMock(page, []);
        const response = await page.goto('/category/no-such-category');

        expect([200, 404]).toContain(response?.status());
        await expect(page.locator('body')).toBeVisible();
    });
});
