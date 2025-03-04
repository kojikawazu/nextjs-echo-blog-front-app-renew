import { test, expect } from '@playwright/test';
import { setupFetchBlogByIdMock, setupFetchSidebarMock } from '../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { mockBlog, mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';

test.describe('Blog Detail Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: false }),
            // 記事一覧のモック
            setupFetchBlogByIdMock(page, mockBlog),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            // GitHub APIのモック
            await page.route('https://api.github.com/**', (route) => {
                route.fulfill({
                    status: 200,
                    body: 'This is mock markdown content.',
                });
            }),
        ]);
    });

    test('Unauthenticated blog detail page', async ({ page }) => {
        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // 未認証でもブログ詳細ページにアクセスできる
        await expect(page).toHaveURL('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Unauthenticated blog detail page is displayed correctly', async ({ page }) => {
        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // ブログの日付が表示されていることを確認
        await expect(page.getByRole('time').getByText('2021/1/1')).toBeVisible();

        // スクショ
        await page.screenshot({ path: 'screenshot.png', fullPage: true });

        // ブログのタイトルが表示されていることを確認
        await expect(page.getByRole('heading', { name: 'Test Blog 1' })).toBeVisible();

        // ブログのタグが表示されていることを確認
        await expect(page.locator('article').getByText('Test Tag 1')).toBeVisible();
        await expect(page.locator('article').getByText('Test Tag 2')).toBeVisible();

        // ブログの説明が表示されていることを確認
        await expect(page.getByText('This is a test blog')).toBeVisible();

        // ブログのいいね数が表示されていることを確認
        await expect(page.getByText('10')).toBeVisible();

        // ブログのコメント数が表示されていることを確認
        await expect(page.getByText('5')).toBeVisible();
    });

    test('Comment form is displayed correctly', async ({ page }) => {
        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // コメントフォームが表示されていることを確認
        await expect(page.getByRole('heading', { name: 'コメント' })).toBeVisible();

        // コメントフォームが表示されていることを確認
        await expect(page.getByLabel('名前')).toBeVisible();

        // コメントフォームが表示されていることを確認
        await expect(page.getByRole('button', { name: 'コメントを送信' })).toBeVisible();
    });

    test('Blog detail page sidebar is displayed correctly', async ({ page }) => {
        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // カテゴリー(サイドバー)が表示されていることを確認
        await expect(page.getByRole('heading', { name: 'カテゴリー' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Category 1' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Category 2' })).toBeVisible();

        // 人気記事(サイドバー)が表示されていることを確認
        await expect(page.getByRole('heading', { name: '人気記事' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Blog 1' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Blog 2' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Blog 3' })).toBeVisible();

        // タグ(サイドバー)が表示されていることを確認
        await expect(page.getByRole('heading', { name: 'タグ' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Tag 1' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Test Tag 2' })).toBeVisible();
    });
});
