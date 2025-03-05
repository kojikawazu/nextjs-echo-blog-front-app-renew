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
    await page.route('**/api/comments/blog/*', async (route, request: Request) => {
        await route.fulfill({
            status: status,
            contentType: 'application/json',
            body: JSON.stringify(responseBody),
        });
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
    await page.route('**/api/comments/create', async (route, request: Request) => {
        await route.fulfill({
            status: status,
            contentType: 'application/json',
            body: JSON.stringify(responseBody),
        });
    });
};
