import { test, expect } from '@playwright/test';
import {
    mockCreateBlogAPI,
    setupFetchBlogsMock,
    setupFetchSidebarMock,
} from '../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';

test.describe('Blog New Form Page (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで認証状態を返す）
            setupAuthCheckMock(page, { authenticated: true }),
            // 記事一覧のモック
            setupFetchBlogsMock(page, mockBlogs),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        // ブログ一覧ページにアクセス
        await page.goto('/');
        // ローディング終了まで待機
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 10000 });

        // ブログ新規作成ページにアクセス
        await page.getByRole('link', { name: '新規投稿' }).click();
        // 表示されるまで待機
        await page.waitForSelector('text=/記事の作成/', { timeout: 10000 });
    });

    test('Blog New Form Page is displayed', async ({ page }) => {
        // ブログ新規作成ページが表示される
        await expect(page).toHaveURL('/new');
    });

    test('Blog New Form Page is displayed correctly', async ({ page }) => {
        // ブログ新規作成ページのタイトルが表示される
        await expect(page.getByRole('heading', { name: '記事の作成' })).toBeVisible();

        // ブログ新規作成フォームが表示される
        await expect(page.getByLabel('タイトル')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toBeVisible();

        await expect(page.getByLabel('GitHub URL')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toBeVisible();

        await expect(page.getByLabel('カテゴリ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toBeVisible();

        await expect(page.getByLabel('タグ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タグ' })).toBeVisible();

        await expect(page.getByLabel('内容')).toBeVisible();
        await expect(page.getByRole('textbox', { name: '内容' })).toBeVisible();

        await expect(page.getByRole('button', { name: '作成' })).toBeVisible();
    });

    test('Blog New Form Page create blog', async ({ page }) => {
        // APIモックを設定
        await mockCreateBlogAPI(page, {
            status: 201,
            responseBody: {
                id: '123',
                title: 'New Blog',
                description: 'New Content',
                category: 'New Category',
                tags: ['New Tag'],
                githubUrl: 'https://github.com/new-blog',
            },
        });

        // ブログ新規作成フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('New Blog');
        await page.getByRole('textbox', { name: 'GitHub URL' }).fill('https://github.com/new-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('New Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('New Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('New Content');

        // 作成ボタンをクリック
        await page.getByRole('button', { name: '作成' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を作成しますか？')).toBeVisible();
        // モーダ内の「作成」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '作成' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 作成後の画面遷移を確認
        await expect(page).toHaveURL('/');

        // 成功メッセージや新しいブログ記事が表示されることを確認
        await expect(page.getByText('ブログを作成しました')).toBeVisible();
    });

    test('Blog New Form Page create blog cancel', async ({ page }) => {
        // ブログ新規作成フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('New Blog');
        await page.getByRole('textbox', { name: 'GitHub URL' }).fill('https://github.com/new-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('New Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('New Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('New Content');

        // 作成ボタンをクリック
        await page.getByRole('button', { name: '作成' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を作成しますか？')).toBeVisible();
        // モーダ内の「作成」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 作成後の画面遷移を確認
        await expect(page).toHaveURL('/new');
    });

    test('Blog New Form Page validation errors', async ({ page }) => {
        // タイトルが未入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('');
        await page.getByRole('textbox', { name: 'GitHub URL' }).fill('invalid-url');

        // 作成ボタンをクリック
        await page.getByRole('button', { name: '作成' }).click();

        // バリデーションエラーの表示確認
        await expect(page.getByText('本当にこの記事を作成しますか？')).not.toBeVisible();
    });

    test('Blog New Form Page fetch error handling', async ({ page }) => {
        // APIリクエストをモックでエラーにする
        await mockCreateBlogAPI(page, {
            status: 500,
            responseBody: { error: 'サーバーエラーが発生しました' },
        });

        // フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('New Blog');
        await page.getByRole('textbox', { name: 'GitHub URL' }).fill('https://github.com/new-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('New Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('New Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('New Content');

        // 作成ボタンをクリック
        await page.getByRole('button', { name: '作成' }).click();

        // 確認モーダルが表示されることを確認
        await expect(page.getByText('本当にこの記事を作成しますか？')).toBeVisible();
        // モーダ内の「作成」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '作成' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // APIエラー後のエラーメッセージの確認
        await expect(page.getByText('ブログの作成に失敗しました')).toBeVisible();
    });
});
