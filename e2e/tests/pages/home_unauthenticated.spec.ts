import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/auth-api-mock';

test.describe('Home Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
    });

    test('Unauthenticated user is redirected to login page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // 未認証でもホームにアクセスできる
        await expect(page).toHaveURL('/');
    });

    test('Home page is displayed (header)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ヘッダータイトル
        await expect(page.getByRole('heading', { name: 'TechBlog' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'TechBlog' })).toHaveText('TechBlog');

        // 記事一覧
        await expect(page.getByText('記事一覧')).toBeVisible();
        await expect(page.getByRole('link', { name: '記事一覧' })).toBeVisible();

        // ログインボタン
        await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
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

    test('Header login link redirects to login page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ログインボタンをクリック
        await page.getByRole('link', { name: 'ログイン' }).click();

        // ログインページにリダイレクトされる
        await expect(page).toHaveURL('/login');
    });

    // ------------------------------------------------------------
});
