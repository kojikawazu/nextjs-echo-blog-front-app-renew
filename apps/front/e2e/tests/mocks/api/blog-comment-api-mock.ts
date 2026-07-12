import { Page, Request } from '@playwright/test';
import type { Comment } from '@/app/types/blogs';

/**
 * ブログコメントデータをfetchするmock
 * @param page
 * @param statusCode
 * @param responseBody
 */
export const setupFetchCommentsMock = async (
    page: Page,
    { status = 200, responseBody = [] }: { status?: number; responseBody?: Comment[] },
) => {
    await page.route('**/api/comments/*', async (route, request: Request) => {
        if (request.method() === 'GET') {
            await route.fulfill({
                status: status,
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * ブログコメントを追加するmock
 * @param page
 * @param statusCode
 * @param responseBody
 */
export const setupAddCommentMock = async (
    page: Page,
    {
        status = 200,
        responseBody = {},
    }: { status?: number; responseBody?: Record<string, unknown> },
) => {
    await page.route('**/api/comments', async (route, request: Request) => {
        if (request.method() === 'POST') {
            await route.fulfill({
                status: status,
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        } else {
            await route.fallback();
        }
    });
};
