import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import {
    setupFetchLikedBlogsMock,
    setupGenerateVisitIdMock,
} from '../../mocks/api/blog-likes-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

// newest順で最初に表示されるブログ（created_at: '2021-01-04'）
const LIKED_BLOG_ID = '4';

test.describe('Blog: いいね機能', () => {
    test.beforeEach(async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            setupGenerateVisitIdMock(page),
        ]);
    });

    test('N-1: いいねボタンが表示される', async ({ page }) => {
        await setupFetchLikedBlogsMock(page, []);

        await page.goto('/');
        await page.waitForSelector('[data-testid="like-count"]', { timeout: 20000 });

        await expect(page.getByTestId('like-count').first()).toBeVisible();
    });

    test('N-2: いいね済み状態が反映される（青色ボタン）', async ({ page }) => {
        await setupFetchLikedBlogsMock(page, [LIKED_BLOG_ID]);

        await page.goto('/');
        await page.waitForSelector('[data-testid="like-count"]', { timeout: 20000 });

        // いいね済みのカードのボタンが青色になっている（text-gray-500がない＝いいね済み）
        const likeButton = page
            .locator('button')
            .filter({ has: page.getByTestId('like-count') })
            .first();
        await expect(likeButton).not.toHaveClass(/text-gray-500/);
    });

    test('N-3: いいねを押すとAPIが呼ばれる', async ({ page }) => {
        await setupFetchLikedBlogsMock(page, []);

        let likeApiCalled = false;
        await page.route('**/api/blog-likes/*', async (route, request) => {
            if (request.method() === 'POST') {
                likeApiCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
            } else {
                await route.fallback();
            }
        });

        await page.goto('/');
        await page.waitForSelector('[data-testid="like-count"]', { timeout: 20000 });

        const likeButton = page
            .locator('button')
            .filter({ has: page.getByTestId('like-count') })
            .first();
        // 未いいね状態（グレー）であることを確認してからクリック
        await expect(likeButton).toHaveClass(/text-gray-500/, { timeout: 10000 });
        await likeButton.click();

        expect(likeApiCalled).toBe(true);
    });

    test('S-1: いいね取り消しを押すとAPIが呼ばれる', async ({ page }) => {
        await setupFetchLikedBlogsMock(page, [LIKED_BLOG_ID]);

        let unlikeApiCalled = false;
        await page.route('**/api/blog-likes/*', async (route, request) => {
            if (request.method() === 'DELETE') {
                unlikeApiCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
            } else {
                await route.fallback();
            }
        });

        await page.goto('/');
        await page.waitForSelector('[data-testid="like-count"]', { timeout: 20000 });

        const likeButton = page
            .locator('button')
            .filter({ has: page.getByTestId('like-count') })
            .first();
        // いいね済みデータがロードされ青色（text-gray-500なし）になるまで待ってからクリック
        await expect(likeButton).not.toHaveClass(/text-gray-500/, { timeout: 10000 });
        await likeButton.click();

        expect(unlikeApiCalled).toBe(true);
    });

    test('S-2: 最後のいいねを解除するとボタンが未いいね表示（グレー）に戻る（#17）', async ({
        page,
    }) => {
        // いいね状態を持つ一覧モック。解除後は 0 件となり、Go バックエンドと同じく null を返す
        // （BFF は [] に正規化するが、クライアント側でも null を 0 件として扱えることを検証する）
        let liked = true;
        await page.route('**/api/blog-likes', async (route, request) => {
            if (request.method() !== 'GET') return route.fallback();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: liked ? JSON.stringify([{ blog_id: LIKED_BLOG_ID }]) : 'null',
            });
        });
        await page.route('**/api/blog-likes/*', async (route, request) => {
            if (request.method() !== 'DELETE') return route.fallback();
            liked = false;
            await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        });

        await page.goto('/');
        await page.waitForSelector('[data-testid="like-count"]', { timeout: 20000 });

        const likeButton = page
            .locator('button')
            .filter({ has: page.getByTestId('like-count') })
            .first();
        await expect(likeButton).not.toHaveClass(/text-gray-500/, { timeout: 10000 });
        await likeButton.click();

        // 修正前は一覧の再取得が TypeError で失敗し、いいね済み（青）のまま残っていた
        await expect(likeButton).toHaveClass(/text-gray-500/, { timeout: 10000 });
    });
});
