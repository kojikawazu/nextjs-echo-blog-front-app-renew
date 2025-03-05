import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../mocks/api/blog-api-mock';
import { mockBlogs } from '../mocks/blog/blog-mock';

test.describe('Home Page (Unauthenticated) paging', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: false }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
        ]);
    });

    test('Pagination is displayed correctly', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ページネーションが表示されていることを確認
        await expect(page.getByRole('button', { name: '前のページへ' })).toBeVisible();
        await expect(
            page
                .locator('div[role="navigation"], nav, div.flex.items-center.justify-center')
                .getByRole('button', { name: '1', exact: true }),
        ).toBeVisible();
        await expect(
            page
                .locator('div[role="navigation"], nav, div.flex.items-center.justify-center')
                .getByRole('button', { name: '2', exact: true }),
        ).toBeVisible();
        await expect(page.getByRole('button', { name: '次のページへ' })).toBeVisible();

        // ページネーションのボタンの色が変更されていることを確認
        await expect(
            page
                .locator('div[role="navigation"], nav, div.flex.items-center.justify-center')
                .getByRole('button', { name: '1', exact: true }),
        ).toHaveClass(/bg-sky-500.*text-white/);
        await expect(
            page
                .locator('div[role="navigation"], nav, div.flex.items-center.justify-center')
                .getByRole('button', { name: '2', exact: true }),
        ).not.toHaveClass(/bg-sky-500.*text-white/);
    });

    // 前へ戻るボタンのクリック
    test('Previous button clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 2番目のページングボタンをクリック
        await page.getByRole('button', { name: '2' }).nth(1).click();

        // 500ms待つ
        await page.waitForTimeout(500);

        // 前へ戻るボタンをクリック
        await page.getByRole('button', { name: '前のページへ' }).click();

        // 500ms待つ
        await page.waitForTimeout(500);

        // 前へ戻るボタンが無効になっていることを確認
        await expect(page.getByRole('button', { name: '前のページへ' })).toBeDisabled();
    });

    // 次へ進むボタンのクリック
    test('Next button clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 次   へ進むボタンをクリック
        await page.getByRole('button', { name: '次のページへ' }).click();

        // 500ms待つ
        await page.waitForTimeout(500);

        // 次へ進むボタンが無効になっていることを確認
        await expect(page.getByRole('button', { name: '次のページへ' })).toBeDisabled();
    });

    // 次へ進むボタンのクリック
    test('Page number button clickable', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 2番目のページングボタンをクリック
        await page.getByRole('button', { name: '2' }).nth(1).click();

        // 500ms待つ
        await page.waitForTimeout(500);

        // 次へ進むボタンが無効になっていることを確認
        await expect(page.getByRole('button', { name: '次のページへ' })).toBeDisabled();

        // 1番目のページングボタンをクリック
        await page.getByRole('button', { name: '1' }).nth(1).click();

        // 500ms待つ
        await page.waitForTimeout(500);

        // 前へ戻るボタンが無効になっていることを確認
        await expect(page.getByRole('button', { name: '前のページへ' })).toBeDisabled();
    });
});
