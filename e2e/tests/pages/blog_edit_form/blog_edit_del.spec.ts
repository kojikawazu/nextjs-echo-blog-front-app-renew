import { test, expect } from '@playwright/test';
import {
    mockUpdateBlogAPI,
    mockDeleteBlogAPI,
    setupFetchBlogByIdMock,
    setupFetchBlogsMock,
    setupFetchSidebarMock,
} from '../../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import {
    mockBlog,
    mockBlogs,
    mockCategories,
    mockPopularPosts,
    mockTags,
} from '../../mocks/blog/blog-mock';

test.describe('Blog New Form Page (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで認証状態を返す）
            setupAuthCheckMock(page, { authenticated: true }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
            // 記事のモック
            setupFetchBlogByIdMock(page, mockBlog),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        // ブログ一覧ページにアクセス
        await page.goto('/');
        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // ブログ編集ページにアクセス
        await page.getByRole('link', { name: '編集' }).click();
        // 表示されるまで待機
        await page.waitForSelector('text=/記事の編集/', { timeout: 10000 });
    });

    test('Blog Edit Form Page delete blog', async ({ page }) => {
        // APIモックを設定
        await mockDeleteBlogAPI(page, 200, {});

        // 削除ボタンをクリック
        await page.getByRole('button', { name: '削除' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を削除しますか？')).toBeVisible();

        // モーダ内の「削除」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '削除' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 記事一覧ページに遷移することを確認
        await expect(page).toHaveURL('/');

        // 記事が削除されたことを確認
        await expect(page.getByText('ブログを削除しました')).toBeVisible();
    });

    test('Blog Edit Form Page delete blog cancel', async ({ page }) => {
        // APIモックを設定
        await mockDeleteBlogAPI(page, 200, {});

        // 削除ボタンをクリック
        await page.getByRole('button', { name: '削除' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を削除しますか？')).toBeVisible();

        // モーダ内の「キャンセル」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 記事編集ページに遷移することを確認
        await expect(page).toHaveURL('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Blog Edit Form Page delete blog error', async ({ page }) => {
        // APIモックを設定
        await mockDeleteBlogAPI(page, 500, {});

        // 削除ボタンをクリック
        await page.getByRole('button', { name: '削除' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を削除しますか？')).toBeVisible();

        // モーダ内の「削除」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '削除' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 記事編集ページに遷移することを確認
        await expect(page).toHaveURL('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // エラーメッセージの確認
        await expect(page.getByText('ブログの削除に失敗しました')).toBeVisible();
    });
});
