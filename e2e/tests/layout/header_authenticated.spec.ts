import { test, expect } from '@playwright/test';
import { setupAuthCheckMock, setupLogoutMock } from '../mocks/api/auth-api-mock';

test.describe('Header (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        // APIのモック設定（auth-checkで認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: true });
    });

    test('Header is displayed (authenticated)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ヘッダータイトル
        await expect(page.getByRole('heading', { name: 'TechBlog' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'TechBlog' })).toHaveText('TechBlog');

        // 記事一覧
        await expect(page.getByText('記事一覧')).toBeVisible();
        await expect(page.getByRole('link', { name: '記事一覧' })).toBeVisible();

        // 新規投稿
        await expect(page.getByRole('link', { name: '新規投稿' })).toBeVisible();

        // 名前
        await expect(page.getByText('Mock User')).toBeVisible();

        // ログアウト
        await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
    });

    test('Header title link redirects to home page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ヘッダータイトルをクリック
        await page.getByRole('heading', { name: 'TechBlog' }).click();

        // ホームページにリダイレクトされる
        await expect(page).toHaveURL('/');
    });

    test('Header article list link redirects to article list page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // 記事一覧をクリック
        await page.getByRole('link', { name: '記事一覧' }).click();

        await expect(page).toHaveURL('/');
    });

    test('Header new post link redirects to new post page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // 新規投稿をクリック
        await page.getByRole('link', { name: '新規投稿' }).click();

        // 新規投稿ページにリダイレクトされる
        await expect(page).toHaveURL('/new');
    });

    test('Header logout link redirects to login page', async ({ page }) => {
        // ログアウトAPIのモック設定
        await setupLogoutMock(page, { success: true });

        // ホームページにアクセス
        await page.goto('/');

        // ログアウトをクリック
        await page.getByRole('button', { name: 'ログアウト' }).click();

        // ログアウトページにリダイレクトされる
        await expect(page).toHaveURL('/');

        // ヘッダータイトル
        await expect(page.getByRole('heading', { name: 'TechBlog' })).toBeVisible();

        // 認証状態を未認証に設定
        await setupAuthCheckMock(page, { authenticated: false });

        // ログイン画面にリダイレクトするまで待機
        await page.waitForURL('/login');
    });
});
