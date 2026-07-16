import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import { mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

test.describe('ブログホーム: APIエラーハンドリング', () => {
    test('S-1: ブログ一覧APIが404を返してもページがクラッシュしない', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.route('**/api/blogs', async (route, request) => {
            if (request.method() === 'GET') {
                await route.fulfill({ status: 404, contentType: 'application/json', body: '[]' });
            } else {
                await route.fallback();
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // ページがクラッシュしていない
        await expect(page.locator('body')).toBeVisible();
    });

    test('S-2: ブログ一覧APIが500を返してもページがクラッシュしない', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.route('**/api/blogs', async (route, request) => {
            if (request.method() === 'GET') {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal Server Error' }),
                });
            } else {
                await route.fallback();
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toBeVisible();
    });

    test('S-3: 認証チェックAPIが401を返してもページがクラッシュしない', async ({ page }) => {
        await page.route('**/api/auth/check', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Unauthorized' }),
            });
        });

        await page.route('**/api/blogs', async (route, request) => {
            if (request.method() === 'GET') {
                await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
            } else {
                await route.fallback();
            }
        });

        await setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts);

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('body')).toBeVisible();
    });
});
