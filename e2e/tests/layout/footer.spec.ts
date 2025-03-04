import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';

test.describe('Footer (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
    });

    test('Footer is displayed (unauthenticated)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // サイト概要
        await expect(page.getByText('サイト概要')).toBeVisible();
        await expect(page.getByText('TechBlogは、')).toBeVisible();

        // リンク
        await expect(page.getByText('リンク')).toBeVisible();
        await expect(page.getByRole('link', { name: 'お問い合わせ' })).toBeVisible();

        // フォロー
        await expect(page.getByText('フォロー')).toBeVisible();
        await expect(page.getByText('Twitter')).toBeVisible();
        await expect(page.getByText('GitHub')).toBeVisible();

        // Copyright
        await expect(page.getByText(`© ${new Date().getFullYear()} TechBlog`)).toBeVisible();
    });

    test('Footer contact link redirects to contact page', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // お問い合わせをクリック
        await page.getByRole('link', { name: 'お問い合わせ' }).click();

        // お問い合わせページにリダイレクトされる
        await expect(page).toHaveURL('/contact');
    });
});
