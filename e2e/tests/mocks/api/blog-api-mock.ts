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
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(blogs),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * ブログデータをfetchするmock
 * @param page
 * @param blog
 */
export const setupFetchBlogByIdMock = async (page: Page, blog: Blog = mockBlog) => {
    await page.route('**/api/blogs/2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234', async (route) => {
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
        page.route('**/api/blogs/categories', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(categories),
            });
        }),
        page.route('**/api/blogs/tags', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(tags),
            });
        }),
        page.route('**/api/blogs/popular/*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(popularPosts),
            });
        }),
    ]);
};

/**
 * ブログを作成するmock
 * @param page
 * @param status
 * @param responseBody
 */
export const mockCreateBlogAPI = async (
    page: Page,
    {
        status = 200,
        responseBody = {},
    }: { status?: number; responseBody?: Record<string, unknown> },
) => {
    await page.route('**/api/blogs', async (route, request) => {
        if (request.method() === 'POST') {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * ブログを更新するmock
 * @param page
 * @param status
 * @param responseBody
 */
export const mockUpdateBlogAPI = async (
    page: Page,
    {
        status = 200,
        responseBody = {},
    }: { status?: number; responseBody?: Record<string, unknown> },
) => {
    await page.route('**/api/blogs/*', async (route, request) => {
        if (request.method() === 'PUT') {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        } else {
            await route.fallback();
        }
    });
};

/**
 * ブログを削除するmock
 * @param page
 * @param status
 * @param responseBody
 */
export const mockDeleteBlogAPI = async (page: Page, status = 200, responseBody = {}) => {
    await page.route('**/api/blogs/*', async (route, request) => {
        if (request.method() === 'DELETE') {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        } else {
            await route.fallback();
        }
    });
};
