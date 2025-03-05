import { test, expect } from '@playwright/test';
import { setupFetchBlogByIdMock, setupFetchSidebarMock } from '../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../mocks/api/auth-api-mock';
import { mockBlog, mockCategories, mockPopularPosts, mockTags } from '../mocks/blog/blog-mock';
import { mockComments, mockCommentsAfterAdd } from '../mocks/blog/blog-comment-mock';
import { setupAddCommentMock, setupFetchCommentsMock } from '../mocks/api/blog-comment-api-mock';

test.describe('Blog Detail Page (Unauthenticated)', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            // APIのモック設定（auth-checkで未認証状態を返す）
            setupAuthCheckMock(page, { authenticated: false }),
            // 記事一覧のモック
            setupFetchBlogByIdMock(page, mockBlog),
            // サイドバーのモック
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            // ブログコメントのモック
            setupFetchCommentsMock(page, { status: 200, responseBody: mockComments }),
            // GitHub APIのモック
            await page.route('https://api.github.com/**', (route) => {
                route.fulfill({
                    status: 200,
                    body: 'This is mock markdown content.',
                });
            }),
        ]);

        // ブログ詳細ページにアクセス
        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234');
        // ローディング終了まで待つ
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });
    });

    test('Comment Form is displayed', async ({ page }) => {
        // コメントフォームが表示される
        await expect(page.getByRole('heading', { name: 'コメント' })).toBeVisible();

        // 名前入力欄が表示される
        await expect(page.getByLabel('名前')).toBeVisible();
        await expect(page.getByRole('textbox', { name: '名前' })).toBeVisible();

        // コメント入力欄が表示される
        await expect(page.getByLabel('コメント')).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'コメント' })).toBeVisible();

        // コメント送信ボタンが表示される
        await expect(page.getByRole('button', { name: 'コメントを送信' })).toBeVisible();
    });

    test('Comment list is displayed', async ({ page }) => {
        // コメントが表示される
        await expect(page.getByText('Test User').first()).toBeVisible();
        await expect(page.getByText('Test Comment 1')).toBeVisible();
        await expect(page.getByText('/1/1').nth(1)).toBeVisible();

        await expect(page.getByText('Test User').nth(1)).toBeVisible();
        await expect(page.getByText('Test Comment 2')).toBeVisible();
        await expect(page.getByText('/1/2')).toBeVisible();

        await expect(page.getByText('Test User').nth(2)).toBeVisible();
        await expect(page.getByText('Test Comment 3')).toBeVisible();
        await expect(page.getByText('/1/3')).toBeVisible();

        await expect(page.getByText('Test User').nth(3)).toBeVisible();
        await expect(page.getByText('Test Comment 4')).toBeVisible();
        await expect(page.getByText('/1/4')).toBeVisible();
    });

    test('Comment add success', async ({ page }) => {
        // Add Mock
        await setupAddCommentMock(page, {
            status: 200,
            responseBody: {
                id: '5',
                comment: 'Test Comment 5',
                created_at: '2021-01-05',
                blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
                guest_user: 'Test User',
            },
        });
        await setupFetchCommentsMock(page, { status: 200, responseBody: mockCommentsAfterAdd });

        // コメントを追加
        await page.getByRole('textbox', { name: '名前' }).fill('Test User');
        await page.getByRole('textbox', { name: 'コメント' }).fill('Test Comment 5');
        await page.getByRole('button', { name: 'コメントを送信' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // コメントが表示される
        await expect(page.getByText('Test User').nth(4)).toBeVisible();
        await expect(page.getByText('Test Comment 5')).toBeVisible();
        await expect(page.getByText('/1/5')).toBeVisible();
    });

    test('Comment add invalid', async ({ page }) => {
        // コメントを追加
        await page.getByRole('textbox', { name: '名前' }).fill('');
        await page.getByRole('textbox', { name: 'コメント' }).fill('');
        await page.getByRole('button', { name: 'コメントを送信' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // コメントが追加されない
        await expect(page.getByText('Test User').nth(4)).not.toBeVisible();
    });

    test('Comment add error', async ({ page }) => {
        // Add Mock
        await setupAddCommentMock(page, {
            status: 400,
            responseBody: {
                error: 'test error',
            },
        });

        // コメントを追加
        await page.getByRole('textbox', { name: '名前' }).fill('Test User');
        await page.getByRole('textbox', { name: 'コメント' }).fill('Test Comment 5');
        await page.getByRole('button', { name: 'コメントを送信' }).click();

        // 500ms待機
        await page.waitForTimeout(500);

        // コメントが追加されない
        await expect(page.getByText('Test User').nth(4)).not.toBeVisible();
    });
});
