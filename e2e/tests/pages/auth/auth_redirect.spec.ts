import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import { mockBlogs, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

test.describe('認証リダイレクト', () => {
    test('N-1: 未認証で /new にアクセスするとトップページにリダイレクトされる', async ({
        page,
    }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.goto('/new');
        // useEffect内でrouter.push('/')が呼ばれるまで待機
        await page.waitForURL('/', { timeout: 10000 });

        await expect(page).toHaveURL('/');
    });

    test('N-2: 認証済みで /new にアクセスするとフォームが表示される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: true }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.goto('/new');
        await page.waitForLoadState('networkidle');

        // フォームが表示されている（リダイレクトされていない）
        await expect(page).toHaveURL('/new');
    });

    test('S-1: 未認証で /edit ページにアクセスするとリダイレクトされる', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.goto('/blog/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234/edit');
        await page.waitForURL('/', { timeout: 10000 });

        await expect(page).toHaveURL('/');
    });
});
