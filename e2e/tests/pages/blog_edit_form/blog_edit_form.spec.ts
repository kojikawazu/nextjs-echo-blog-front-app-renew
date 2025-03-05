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

    test('Blog Edit Form Page is displayed', async ({ page }) => {
        // ブログ編集ページが表示される
        await expect(page).toHaveURL('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Blog New Form Page is displayed correctly', async ({ page }) => {
        // ブログ編集ページのタイトルが表示される
        await expect(page.getByRole('heading', { name: '記事の編集' })).toBeVisible();

        // ブログ削除ボタンが表示される
        await expect(page.getByRole('button', { name: '削除' })).toBeVisible();

        // ブログ編集フォームが表示される
        await expect(page.getByLabel('タイトル')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toBeVisible();
        // タイトルが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'タイトル' })).toHaveValue(mockBlog.title);

        await expect(page.getByLabel('GitHub URL')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toBeVisible();
        // GitHub URLが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'GitHub URL' })).toHaveValue(
            mockBlog.github_url ?? '',
        );

        await expect(page.getByLabel('カテゴリ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toBeVisible();
        // カテゴリが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'カテゴリ' })).toHaveValue(
            mockBlog.category,
        );

        await expect(page.getByLabel('タグ')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'タグ' })).toBeVisible();
        // タグが入力されていることを確認
        await expect(page.getByRole('textbox', { name: 'タグ' })).toHaveValue(
            mockBlog.tags.join(', '),
        );

        await expect(page.getByLabel('内容')).toBeVisible();
        await expect(page.getByRole('textbox', { name: '内容' })).toBeVisible();
        // 内容が入力されていることを確認
        await expect(page.getByRole('textbox', { name: '内容' })).toHaveValue(mockBlog.description);

        await expect(page.getByRole('button', { name: '更新' })).toBeVisible();
    });

    test('Blog Edit Form Page update blog', async ({ page }) => {
        // APIモックを設定
        await mockUpdateBlogAPI(page, {
            status: 200,
            responseBody: {
                id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
                user_id: 'mock-user-id',
                title: 'Updated Blog',
                description: 'Updated Content',
                category: 'Updated Category',
                tags: ['Updated Tag'],
                github_url: 'https://github.com/updated-blog',
            },
        });

        // ブログ編集フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('Updated Blog');
        await page
            .getByRole('textbox', { name: 'GitHub URL' })
            .fill('https://github.com/updated-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('Updated Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('Updated Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('Updated Content');

        // 更新ボタンをクリック
        await page.getByRole('button', { name: '更新' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を更新しますか？')).toBeVisible();
        // モーダ内の「更新」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '更新' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 作成後の画面遷移を確認
        await expect(page).toHaveURL('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');

        // 成功メッセージや新しいブログ記事が表示されることを確認
        await expect(page.getByText('ブログを更新しました')).toBeVisible();
    });

    test('Blog New Form Page update blog cancel', async ({ page }) => {
        // ブログ編集フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('Updated Blog');
        await page
            .getByRole('textbox', { name: 'GitHub URL' })
            .fill('https://github.com/updated-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('Updated Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('Updated Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('Updated Content');

        // 更新ボタンをクリック
        await page.getByRole('button', { name: '更新' }).click();

        // 確認モーダが表示されることを確認
        await expect(page.getByText('本当にこの記事を更新しますか？')).toBeVisible();
        // モーダ内の「更新」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // 作成後の画面遷移を確認
        await expect(page).toHaveURL('/edit/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
    });

    test('Blog Edit Form Page validation errors', async ({ page }) => {
        // タイトルが未入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('');
        await page.getByRole('textbox', { name: 'GitHub URL' }).fill('invalid-url');

        // 更新ボタンをクリック
        await page.getByRole('button', { name: '更新' }).click();

        // バリデーションエラーの表示確認
        await expect(page.getByText('本当にこの記事を更新しますか？')).not.toBeVisible();
    });

    test('Blog Edit Form Page fetch error handling', async ({ page }) => {
        // APIリクエストをモックでエラーにする
        await mockUpdateBlogAPI(page, {
            status: 500,
            responseBody: { error: 'サーバーエラーが発生しました' },
        });

        // フォームに入力
        await page.getByRole('textbox', { name: 'タイトル' }).fill('Updated Blog');
        await page
            .getByRole('textbox', { name: 'GitHub URL' })
            .fill('https://github.com/updated-blog');
        await page.getByRole('textbox', { name: 'カテゴリ' }).fill('Updated Category');
        await page.getByRole('textbox', { name: 'タグ' }).fill('Updated Tag');
        await page.getByRole('textbox', { name: '内容' }).fill('Updated Content');

        // 更新ボタンをクリック
        await page.getByRole('button', { name: '更新' }).click();

        // 確認モーダルが表示されることを確認
        await expect(page.getByText('本当にこの記事を更新しますか？')).toBeVisible();
        // モーダ内の「更新」ボタンをクリック
        await page.getByRole('dialog').getByRole('button', { name: '更新' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // APIエラー後のエラーメッセージの確認
        await expect(page.getByText('ブログの更新に失敗しました')).toBeVisible();
    });
});
