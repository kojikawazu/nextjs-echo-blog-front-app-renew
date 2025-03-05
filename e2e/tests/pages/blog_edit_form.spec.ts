import { test, expect } from '@playwright/test';
import { setupFetchBlogByIdMock, setupFetchSidebarMock } from '../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { mockBlog, mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';

test.describe('Blog New Form Page (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで認証状態を返す）
            setupAuthCheckMock(page, { authenticated: true }),
            // 記事のモック
            setupFetchBlogByIdMock(page, mockBlog),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);
    });

    test('Blog Edit Form Page is displayed', async ({ page }) => {
        // ブログ編集ページにアクセス
        await page.goto('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // ブログ編集ページが表示される
        await expect(page).toHaveURL('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Blog New Form Page is displayed correctly', async ({ page }) => {
        // ブログ編集ページにアクセス
        await page.goto('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // 表示されるまで待機
        await page.waitForSelector('text=/記事の編集/', { timeout: 10000 });

        // ブログ編集ページのタイトルが表示される
        await expect(page.getByRole('heading', { name: '記事の編集' })).toBeVisible();

        // ブログ削除ボタンが表示される
        await expect(page.getByRole('button', { name: '削除' })).toBeVisible();

        // ブログ編集フォームが表示される
        await expect(page.getByLabel('タイトル')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toBeVisible();
        // タイトルが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveValue(mockBlog.title);

        await expect(page.getByLabel('GitHub URL')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toBeVisible();
        // GitHub URLが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toHaveValue(
            mockBlog.github_url ?? '',
        );

        await expect(page.getByLabel('カテゴリ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toBeVisible();
        // カテゴリが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toHaveValue(
            mockBlog.category,
        );

        await expect(page.getByLabel('タグ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タグ' })).toBeVisible();
        // タグが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'タグ' })).toHaveValue(
            mockBlog.tags.join(', '),
        );

        await expect(page.getByLabel('内容')).toBeVisible();
        await expect(page.getByRole('textbox', { name: '内容' })).toBeVisible();
        // 内容が入力されていることを確認
        await expect(page.getByRole('textbox', { name: '内容' })).toHaveValue(mockBlog.description);

        await expect(page.getByRole('button', { name: '更新' })).toBeVisible();
    });

    // 操作系(TODO)
});
