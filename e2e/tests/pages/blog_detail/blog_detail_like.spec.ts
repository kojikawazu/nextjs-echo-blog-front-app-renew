import { test, expect } from '@playwright/test';
import { setupFetchBlogByIdMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import {
    setupFetchLikedBlogsMock,
    setupGenerateVisitIdMock,
    setupLikeBlogMock,
    setupUnlikeBlogMock,
} from '../../mocks/api/blog-likes-api-mock';
import { mockBlog, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

const BLOG_ID = '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234';

test.describe('Blog Detail: いいね機能', () => {
    test('N-1: いいねボタンが表示される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogByIdMock(page, mockBlog),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            setupGenerateVisitIdMock(page),
            setupFetchLikedBlogsMock(page, []),
            page.route('**/api/github/markdown', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ content: 'mock content' }),
                });
            }),
        ]);

        await page.goto(`/blog/${BLOG_ID}`);
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // いいね数が表示されている
        await expect(page.getByTestId('like-count').first()).toBeVisible();
    });

    test('N-2: いいね済み状態が反映される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogByIdMock(page, mockBlog),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            setupGenerateVisitIdMock(page),
            setupFetchLikedBlogsMock(page, [BLOG_ID]),
            page.route('**/api/github/markdown', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ content: 'mock content' }),
                });
            }),
        ]);

        await page.goto(`/blog/${BLOG_ID}`);
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        // いいね済み状態（青色）のボタンが表示されている
        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') });
        await expect(likeButton).toHaveClass(/text-sky-500/);
    });

    test('N-3: いいねを押すとAPIが呼ばれる', async ({ page }) => {
        let likeApiCalled = false;

        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogByIdMock(page, mockBlog),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            setupGenerateVisitIdMock(page),
            setupFetchLikedBlogsMock(page, []),
            page.route('**/api/github/markdown', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ content: 'mock content' }),
                });
            }),
        ]);

        await page.route('**/api/blog-likes/*', async (route, request) => {
            if (request.method() === 'POST') {
                likeApiCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
            } else {
                await route.fallback();
            }
        });

        await page.goto(`/blog/${BLOG_ID}`);
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') });
        await likeButton.first().click();

        expect(likeApiCalled).toBe(true);
    });

    test('S-1: いいね取り消しを押すとAPIが呼ばれる', async ({ page }) => {
        let unlikeApiCalled = false;

        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogByIdMock(page, mockBlog),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
            setupGenerateVisitIdMock(page),
            setupFetchLikedBlogsMock(page, [BLOG_ID]),
            page.route('**/api/github/markdown', (route) => {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ content: 'mock content' }),
                });
            }),
        ]);

        await page.route('**/api/blog-likes/*', async (route, request) => {
            if (request.method() === 'DELETE') {
                unlikeApiCalled = true;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
            } else {
                await route.fallback();
            }
        });

        await page.goto(`/blog/${BLOG_ID}`);
        await page.waitForSelector('text=/Test Blog 1/', { timeout: 20000 });

        const likeButton = page.locator('button').filter({ has: page.getByTestId('like-count') });
        await likeButton.first().click();

        expect(unlikeApiCalled).toBe(true);
    });
});
