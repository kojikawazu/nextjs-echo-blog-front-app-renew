import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import {
    setupFetchLikedBlogsMock,
    setupGenerateVisitIdMock,
} from '../../mocks/api/blog-likes-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

const LIKED_BLOG_ID = '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234';

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

        // いいね済みのカードのボタンが青色になっている
        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') }).first();
        await expect(likeButton).toHaveClass(/text-sky-500/);
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

        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') }).first();
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

        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') }).first();
        await likeButton.click();

        expect(unlikeApiCalled).toBe(true);
    });
});
