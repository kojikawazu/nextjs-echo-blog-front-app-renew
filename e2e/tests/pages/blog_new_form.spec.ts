import { test, expect } from '@playwright/test';
import { setupFetchSidebarMock } from '../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';

test.describe('Blog New Form Page (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで認証状態を返す）
            setupAuthCheckMock(page, { authenticated: true }),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);
    });

    test('Blog New Form Page is displayed', async ({ page }) => {
        // ブログ新規作成ページにアクセス
        await page.goto('/new');

        // ブログ新規作成ページが表示される
        await expect(page).toHaveURL('/new');
    });

    test('Blog New Form Page is displayed correctly', async ({ page }) => {
        // ブログ新規作成ページにアクセス
        await page.goto('/new');

        // 表示されるまで待機
        await page.waitForSelector('text=/記事の作成/', { timeout: 10000 });
        // ブログ新規作成ページのタイトルが表示される
        await expect(page.getByRole('heading', { name: '記事の作成' })).toBeVisible();

        // ブログ新規作成フォームが表示される
        await expect(page.getByLabel('タイトル')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toBeVisible();

        await expect(page.getByLabel('GitHub URL')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toBeVisible();

        await expect(page.getByLabel('カテゴリ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toBeVisible();

        await expect(page.getByLabel('タグ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タグ' })).toBeVisible();

        await expect(page.getByLabel('内容')).toBeVisible();
        await expect(page.getByRole('textbox', { name: '内容' })).toBeVisible();

        await expect(page.getByRole('button', { name: '作成' })).toBeVisible();
    });

    // 操作系(TODO)
});
