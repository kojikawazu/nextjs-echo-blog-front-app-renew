import { test, expect } from '@playwright/test';
import { setupAuthCheckMock } from '../../mocks/api/auth-api-mock';
import { setupFetchBlogsMock, setupFetchBlogByIdMock, setupFetchSidebarMock } from '../../mocks/api/blog-api-mock';
import { mockBlogs, mockBlog, mockCategories, mockPopularPosts, mockTags } from '../../mocks/blog/blog-mock';

const BLOG_ID = '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234';

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
        await page.waitForURL('/', { timeout: 10000 });

        await expect(page).toHaveURL('/');
    });

    test('N-2: 認証済みで /new にアクセスするとフォームが表示される', async ({ page }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: true }),
            setupFetchBlogsMock(page, mockBlogs),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        // 一度トップページで認証状態を確定させてから /new に遷移
        await page.goto('/');
        await page.waitForSelector('h2', { timeout: 10000 });

        await page.goto('/new');
        await page.waitForSelector('text=/記事の作成/', { timeout: 10000 });

        await expect(page).toHaveURL('/new');
    });

    test('S-1: 未認証で /edit ページにアクセスするとログインページにリダイレクトされる', async ({
        page,
    }) => {
        await Promise.all([
            setupAuthCheckMock(page, { authenticated: false }),
            setupFetchBlogByIdMock(page, mockBlog),
            setupFetchSidebarMock(page, mockCategories, mockTags, mockPopularPosts),
        ]);

        await page.goto(`/edit/${BLOG_ID}`);
        await page.waitForURL('/login', { timeout: 10000 });

        await expect(page).toHaveURL('/login');
    });
});
