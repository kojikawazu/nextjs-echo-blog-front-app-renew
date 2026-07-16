import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock } from '../../mocks/api/blog-api-mock';
import { mockBlogs } from '../../mocks/blog/blog-mock';

test.describe('Home Page (Unauthenticated) search', () => {
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

    test('Unauthenticated user can see the latest articles (search, sort, sidebar)', async ({
        page,
    }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

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
        // 新着順ボタンがクリック状態になっていることを確認
        await expect(page.getByRole('button', { name: '新着順' })).toHaveClass(
            /bg-sky-500.*text-white/,
        );

        // 人気順ボタンが表示されていることを確認
        await expect(page.getByRole('button', { name: '人気順' })).toBeVisible();
        // 人気順ボタンが未クリック状態になっていることを確認
        await expect(page.getByRole('button', { name: '人気順' })).not.toHaveClass(
            /bg-sky-500.*text-white/,
        );
    });

    test('Unauthenticated user can see the latest articles (search)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 記事検索フォームに検索クエリを入力
        await page.getByPlaceholder('記事を検索').fill('Test Blog 10');

        // 入力後に即座に結果が反映されない場合、再描画のため少し待つ
        await page.waitForTimeout(500); // 300〜500ms

        // ブログが1つのみ表示されていることを確認
        await expect(page.getByRole('heading', { name: 'Test Blog 10' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Test Blog 11' })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: 'Test Blog 12' })).not.toBeVisible();
        await expect(page.getByRole('heading', { name: 'Test Blog 13' })).not.toBeVisible();
    });

    test('Unauthenticated user can see the latest articles (category)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 記事検索フォームに検索クエリを入力
        await page.getByRole('combobox', { name: 'カテゴリー' }).selectOption('Test Category');

        // 入力後に即座に結果が反映されない場合、再描画のため少し待つ
        await page.waitForTimeout(500); // 300〜500ms

        // ブログがカテゴリーで絞り込まれていることを確認
        await expect(page.getByRole('heading', { name: 'Test Blog 10' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Test Blog 11' })).not.toBeVisible();
    });

    test('Unauthenticated user can see the latest articles (tag)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 記事検索フォームに検索クエリを入力
        await page.getByRole('combobox', { name: 'タグ' }).selectOption('Test Tag 1');

        // 入力後に即座に結果が反映されない場合、再描画のため少し待つ
        await page.waitForTimeout(500); // 300〜500ms

        // ブログがタグで絞り込まれていることを確認
        await expect(page.getByRole('heading', { name: 'Test Blog 10' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Test Blog 11' })).not.toBeVisible();
    });

    test('Unauthenticated user can see the latest articles (sort)', async ({ page }) => {
        // ホームページにアクセス
        await page.goto('/');

        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // 記事検索フォームに検索クエリを入力
        await page.getByRole('button', { name: '人気順' }).click();

        // 入力後に即座に結果が反映されない場合、再描画のため少し待つ
        await page.waitForTimeout(500); // 300〜500ms

        const mainArticles = page.locator('article');

        // ブログが人気順でソートされていることを確認
        await expect(mainArticles.first()).toHaveText(/Test[ ¥t]Blog[ ¥t]15/);
        await expect(mainArticles.nth(1)).toHaveText(/Test[ ¥t]Blog[ ¥t]14/);
        await expect(mainArticles.nth(2)).toHaveText(/Test[ ¥t]Blog[ ¥t]13/);
        await expect(mainArticles.nth(3)).toHaveText(/Test[ ¥t]Blog[ ¥t]12/);
    });
});
