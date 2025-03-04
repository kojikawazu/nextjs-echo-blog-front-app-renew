import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../mocks/api/blog-api-mock';
import { mockBlogs } from '../mocks/blog/blog-mock';

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

        // 未認証でもホームにアクセスできる
        await expect(page).toHaveURL('/');
    });

    test('Search articles', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 最新の記事が表示されていることを確認
        await expect(page.getByText('最新の記事')).toBeVisible();

        // 記事検索フォームが表示されていることを確認
        await expect(page.getByPlaceholder('記事を検索')).toBeVisible();

        // カテゴリードロップダウンが表示されていることを確認
        const categoryDropdown = page.getByRole('combobox', { name: 'カテゴリー' });
        await expect(categoryDropdown).toBeVisible();
        await expect(categoryDropdown).toHaveValue('');

        // タグドロップダウンが表示されていることを確認
        const tagDropdown = page.getByRole('combobox', { name: 'タグ' });
        await expect(tagDropdown).toBeVisible();
        await expect(tagDropdown).toHaveValue('');

        // 新着順ボタンが表示されていることを確認
        await expect(page.getByRole('button', { name: '新着順' })).toBeVisible();
        // 人気順ボタンが表示されていることを確認
        await expect(page.getByRole('button', { name: '人気順' })).toBeVisible();
    });

    test('Unauthenticated user can see the latest articles', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 最新の記事が表示されていることを確認
        await expect(page.getByText('最新の記事')).toBeVisible();

        // 記事検索フォームが表示されていることを確認
        await expect(page.getByPlaceholder('記事を検索')).toBeVisible();

        // カテゴリードロップダウンが表示されていることを確認
        const categoryDropdown = page.getByRole('combobox', { name: 'カテゴリー' });
        await expect(categoryDropdown).toBeVisible();
        await expect(categoryDropdown).toHaveValue('');

        // タグドロップダウンが表示されていることを確認
        const tagDropdown = page.getByRole('combobox', { name: 'タグ' });
        await expect(tagDropdown).toBeVisible();
        await expect(tagDropdown).toHaveValue('');

        // 新着順ボタンが表示されていることを確認
        await expect(page.getByRole('button', { name: '新着順' })).toBeVisible();
        // 人気順ボタンが表示されていることを確認
        await expect(page.getByRole('button', { name: '人気順' })).toBeVisible();

        // 記事メイン部分を示す要素を指定して範囲を絞り込む
        const mainSection = page.locator('main');

        // ブログ記事が表示されることを確認
        await expect(mainSection.getByRole('heading', { name: 'Test Blog 1' })).toBeVisible();
        await expect(mainSection.getByRole('heading', { name: 'Test Blog 2' })).toBeVisible();
        await expect(mainSection.getByRole('heading', { name: 'Test Blog 3' })).toBeVisible();
        await expect(mainSection.getByRole('heading', { name: 'Test Blog 4' })).toBeVisible();

        // 日付が表示されていることを確認
        await expect(mainSection.getByText('2021/1/1')).toBeVisible();
        await expect(mainSection.getByText('2021/1/2')).toBeVisible();
        await expect(mainSection.getByText('2021/1/3')).toBeVisible();
        await expect(mainSection.getByText('2021/1/4')).toBeVisible();

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

        await expect(
            mainArticles.first().locator('[data-testid="like-count"]', { hasText: '4' }),
        ).toBeVisible(); // いいね数
        await expect(
            mainArticles.first().locator('[data-testid="comment-count"]', { hasText: '2' }),
        ).toBeVisible(); // コメント数

        await expect(
            mainArticles.nth(1).locator('[data-testid="like-count"]', { hasText: '6' }),
        ).toBeVisible(); // いいね数
        await expect(
            mainArticles.nth(1).locator('[data-testid="comment-count"]', { hasText: '3' }),
        ).toBeVisible(); // コメント数

        await expect(
            mainArticles.nth(2).locator('[data-testid="like-count"]', { hasText: '8' }),
        ).toBeVisible(); // いいね数
        await expect(
            mainArticles.nth(2).locator('[data-testid="comment-count"]', { hasText: '4' }),
        ).toBeVisible(); // コメント数

        await expect(
            mainArticles.nth(3).locator('[data-testid="like-count"]', { hasText: '10' }),
        ).toBeVisible(); // いいね数
        await expect(
            mainArticles.nth(3).locator('[data-testid="comment-count"]', { hasText: '5' }),
        ).toBeVisible(); // コメント数
    });

    test('Unauthenticated user can see the sidebar', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

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
});
