import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLikeBlog } from '@/app/hooks/useLikeBlog';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * #17 の回帰テスト: 最後のいいねを解除したあと、表示がいいね済みのまま残らないこと。
 *
 * useLikeBlog.test.ts は fetchLikedBlogs をモジュールごとモックしているため、
 * 「バックエンドが null を返す → fetchLikedBlogs が落ちる → TanStack Query が直前の
 * いいね済み一覧を保持する」という不具合の経路を通らない。本ファイルは外部 I/O である
 * global.fetch だけをモックし、フック〜API アクセス層を実物で通す。
 */

const LIKES_URL = COMMON_CONSTANTS.URL.BLOG_LIKE_FETCH_LIKED_BLOGS;

/**
 * いいね状態をメモリ上に持つ偽バックエンド（BFF を経由しない素の応答）を global.fetch に差し込む。
 * いいね 0 件では Go の nil スライスと同じく `null` を返す。
 *
 * @param initial - 初期のいいね済みブログ ID
 */
const installFakeBackend = (initial: string[]) => {
    let liked = [...initial];
    global.fetch = vi.fn(async (url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const json = (body: unknown) => ({ ok: true, json: async () => body }) as Response;

        if (url === LIKES_URL && method === 'GET') {
            return json(liked.length ? liked.map((blog_id) => ({ blog_id })) : null);
        }
        const blogId = url.split('/').pop() as string;
        if (method === 'POST') {
            liked.push(blogId);
            return json({ blog_id: blogId });
        }
        if (method === 'DELETE') {
            liked = liked.filter((id) => id !== blogId);
            return json({ message: 'Blog like deleted successfully' });
        }
        // generate-visit-id
        return json({ message: 'Visitor id already exists' });
    }) as unknown as typeof fetch;
};

const setup = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
    const hook = renderHook(() => useLikeBlog(), { wrapper });
    return { ...hook, queryClient };
};

describe('useLikeBlog（いいね 0 件になる解除・#17 回帰）', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 準正常系 ---

    it('最後のいいねを解除すると hasLiked が false になり、一覧クエリはエラーにならない', async () => {
        installFakeBackend(['blog-1']);
        const { result, queryClient } = setup();
        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));

        act(() => result.current.unlikeBlog('blog-1'));

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(false));
        expect(queryClient.getQueryState(['likedBlogs'])?.status).toBe('success');
        expect(queryClient.getQueryData(['likedBlogs'])).toEqual([]);
    });

    it('いいね 0 件（null）から始めても hasLiked は false で、いいね後は true になる', async () => {
        installFakeBackend([]);
        const { result, queryClient } = setup();
        await waitFor(() =>
            expect(queryClient.getQueryState(['likedBlogs'])?.status).toBe('success'),
        );
        expect(result.current.hasLiked('blog-1')).toBe(false);

        act(() => result.current.likeBlog('blog-1'));

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));
    });

    it('複数いいねのうち 1 件だけ解除すると、その記事だけ false になる', async () => {
        installFakeBackend(['blog-1', 'blog-2']);
        const { result } = setup();
        await waitFor(() => expect(result.current.hasLiked('blog-2')).toBe(true));

        act(() => result.current.unlikeBlog('blog-1'));

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(false));
        expect(result.current.hasLiked('blog-2')).toBe(true);
    });
});
