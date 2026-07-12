import { Page } from '@playwright/test';

/**
 * いいね済みブログ一覧を取得するmock
 * @param page
 * @param likedBlogIds いいね済みのブログID一覧
 */
export const setupFetchLikedBlogsMock = async (page: Page, likedBlogIds: string[] = []) => {
    await page.route('**/api/blog-likes', async (route, request) => {
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(likedBlogIds.map((blog_id) => ({ blog_id }))),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * visitId生成APIのmock
 * @param page
 */
export const setupGenerateVisitIdMock = async (page: Page) => {
    await page.route('**/api/blog-likes/generate-visit-id', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ visit_id: 'mock-visit-id' }),
        });
    });
};

/**
 * いいね追加APIのmock
 * @param page
 * @param status
 */
export const setupLikeBlogMock = async (page: Page, status = 200) => {
    await page.route('**/api/blog-likes/*', async (route, request) => {
        if (request.method() === 'POST') {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * いいね削除APIのmock
 * @param page
 * @param status
 */
export const setupUnlikeBlogMock = async (page: Page, status = 200) => {
    await page.route('**/api/blog-likes/*', async (route, request) => {
        if (request.method() === 'DELETE') {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify({}),
            });
        } else {
            await route.fallback();
        }
    });
};
