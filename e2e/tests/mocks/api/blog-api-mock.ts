import { Page, Request } from '@playwright/test';
import { Blog } from '@/app/types/blogs';
import { mockBlog } from '../blog/blog-mock';

/**
 * ブログデータをfetchするmock
 * @param page
 * @param blogs
 */
export const setupFetchBlogsMock = async (page: Page, blogs: Blog[] = []) => {
    await page.route('**/api/blogs', async (route, request: Request) => {
        const url = new URL(request.url());

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(blogs),
        });
    });
};

/**
 * ブログデータをfetchするmock
 * @param page
 * @param blog
 */
export const setupFetchBlogByIdMock = async (page: Page, blog: Blog = mockBlog) => {
    await page.route('**/api/blogs/detail/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(blog),
        });
    });
};

/**
 * サイドバーのデータをfetchするmock
 * @param page
 * @param categories
 * @param tags
 * @param popularPosts
 */
export const setupFetchSidebarMock = async (
    page: Page,
    categories: string[] = [],
    tags: string[] = [],
    popularPosts: { id: string; title: string; likes: number }[] = [],
) => {
    await Promise.all([
        page.route('**/blogs/categories', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(categories),
            });
        }),
        page.route('**/blogs/tags', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(tags),
            });
        }),
        page.route('**/blogs/popular/*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(popularPosts),
            });
        }),
    ]);
};
