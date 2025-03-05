import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../mocks/api/blog-api-mock';
import { mockBlogs } from '../mocks/blog/blog-mock';

test.describe('Home Page (Unauthenticated) aside', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: false }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
        ]);
    });

    test('Unauthenticated user can see the sidebar', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // サイドバー範囲を限定
        const sidebar = page.locator('aside');

        // サイドバーが表示されていることを確認
        await expect(sidebar.getByRole('heading', { name: 'カテゴリー' })).toBeVisible();
        await expect(sidebar.getByRole('heading', { name: '人気記事' })).toBeVisible();
        await expect(sidebar.getByRole('heading', { name: 'タグ' })).toBeVisible();

        // カテゴリーが表示されていることをサイドバー内で確認
        await expect(sidebar.getByRole('link', { name: 'Test Category' })).toBeVisible();

        // 人気記事が表示されていることを確認
        await expect(sidebar.getByRole('link', { name: 'Test Blog 1' })).toBeVisible();
        await expect(sidebar.getByRole('link', { name: 'Test Blog 2' })).toBeVisible();

        // タグが表示されていることを確認
        await expect(sidebar.getByRole('link', { name: 'Test Tag 1' })).toBeVisible();
        await expect(sidebar.getByRole('link', { name: 'Test Tag 2' })).toBeVisible();
    });

    test('Category links clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // カテゴリーリンクをクリック
        await page.getByRole('link', { name: 'Test Category' }).click();

        // 1000ms待つ
        await page.waitForTimeout(1000);
        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ホームページにリダイレクトされていることを確認
        await expect(page).toHaveURL('/category/Test%20Category');
    });

    test('Popular posts links clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        const aside = page.locator('aside');

        // 人気記事リンクをクリック
        await aside.getByRole('link', { name: 'Test Blog 1' }).click();

        // 1000ms待つ
        await page.waitForTimeout(1000);
        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ブログ詳細ページにリダイレクトされていることを確認
        await expect(page).toHaveURL('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Tag links clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // タグリンクをクリック
        await page.getByRole('link', { name: 'Test Tag 1' }).click();

        // 1000ms待つ
        await page.waitForTimeout(1000);
        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ホームページにリダイレクトされていることを確認
        await expect(page).toHaveURL('/tag/Test%20Tag%201');
    });
});
