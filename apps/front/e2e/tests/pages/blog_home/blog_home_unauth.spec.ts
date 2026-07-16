import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../../mocks/api/blog-api-mock';
import { mockBlogs } from '../../mocks/blog/blog-mock';

test.describe('Home Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: false }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
        ]);
    });

    test('Unauthenticated user is redirected to login page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 未認証でもホームにアクセスできる
        await expect(page).toHaveURL('/');
    });

    test('Unauthenticated user can see the latest articles', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 最新の記事が表示されていることを確認
        await expect(page.getByText('最新の記事')).toBeVisible();

        const mainSection = page.locator('main');

        // ブログ記事が表示されることを確認
        await expect(
            mainSection.getByRole('heading', { name: 'Test Blog 1', exact: true }),
        ).toBeVisible();
        await expect(
            mainSection.getByRole('heading', { name: 'Test Blog 2', exact: true }),
        ).toBeVisible();
        await expect(
            mainSection.getByRole('heading', { name: 'Test Blog 3', exact: true }),
        ).toBeVisible();
        await expect(
            mainSection.getByRole('heading', { name: 'Test Blog 4', exact: true }),
        ).toBeVisible();

        // 日付が表示されていることを確認
        await expect(mainSection.getByText('2021/1/1', { exact: true })).toBeVisible();
        await expect(mainSection.getByText('2021/1/2', { exact: true })).toBeVisible();
        await expect(mainSection.getByText('2021/1/3', { exact: true })).toBeVisible();
        await expect(mainSection.getByText('2021/1/4', { exact: true })).toBeVisible();

        const mainArticles = mainSection.locator('article');

        // カテゴリーが表示されていることを確認
        await expect(
            mainArticles
                .first()
                .locator('div.inline-flex.items-center.bg-sky-100', { hasText: 'Test Category' }),
        ).toBeVisible();

        await expect(
            mainArticles
                .nth(1)
                .locator('div.inline-flex.items-center.bg-sky-100', { hasText: 'Test Category' }),
        ).toBeVisible();

        await expect(
            mainArticles
                .nth(2)
                .locator('div.inline-flex.items-center.bg-sky-100', { hasText: 'Test Category' }),
        ).toBeVisible();

        await expect(
            mainArticles
                .nth(3)
                .locator('div.inline-flex.items-center.bg-sky-100', { hasText: 'Test Category' }),
        ).toBeVisible();

        // タグが表示されていることを確認
        await expect(mainArticles.first().locator('span', { hasText: 'Test Tag 1' })).toBeVisible();
        await expect(mainArticles.nth(1).locator('span', { hasText: 'Test Tag 1' })).toBeVisible();
        await expect(mainArticles.nth(2).locator('span', { hasText: 'Test Tag 1' })).toBeVisible();
        await expect(mainArticles.nth(3).locator('span', { hasText: 'Test Tag 1' })).toBeVisible();

        // 説明が表示されていることを確認
        await expect(
            mainArticles.first().locator('div', { hasText: 'This is a test blog' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(1).locator('div', { hasText: 'This is a test blog' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(2).locator('div', { hasText: 'This is a test blog' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(3).locator('div', { hasText: 'This is a test blog' }),
        ).toBeVisible();

        // いいね数が表示されていることを確認
        await expect(
            mainArticles.first().locator('[data-testid="like-count"]', { hasText: '4' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(1).locator('[data-testid="like-count"]', { hasText: '6' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(2).locator('[data-testid="like-count"]', { hasText: '8' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(3).locator('[data-testid="like-count"]', { hasText: '10' }),
        ).toBeVisible();

        // コメント数が表示されていることを確認
        await expect(
            mainArticles.first().locator('[data-testid="comment-count"]', { hasText: '2' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(1).locator('[data-testid="comment-count"]', { hasText: '3' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(2).locator('[data-testid="comment-count"]', { hasText: '4' }),
        ).toBeVisible();
        await expect(
            mainArticles.nth(3).locator('[data-testid="comment-count"]', { hasText: '5' }),
        ).toBeVisible();
    });

    test('Blog link clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ブログリンクをクリック
        await page.getByRole('link', { name: 'Test Blog 1', exact: true }).click();

        // ブログ詳細ページにリダイレクトされていることを確認
        await expect(page).toHaveURL('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    // いいね（TODO）
});
