import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBlog } from '@/app/hooks/useBlog';

vi.mock('@/app/lib/api/fetchBlogById');

import { fetchBlogById } from '@/app/lib/api/fetchBlogById';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const blog = {
    id: 'blog-1',
    user_id: 'u1',
    title: 'タイトル',
    github_url: 'https://github.com/owner/repo/blob/main/a.md',
    category: 'tech',
    tags: ['go'],
    description: '概要',
    likes: 3,
    comment_cnt: 0,
    created_at: '2024/1/1',
    updated_at: '2024/1/1',
};

describe('useBlog', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('ID を fetchBlogById に渡し、記事を blog として返す', async () => {
        vi.mocked(fetchBlogById).mockResolvedValue(blog);

        const { result } = renderHook(() => useBlog('blog-1'), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.blog).toEqual(blog);
        expect(fetchBlogById).toHaveBeenCalledWith('blog-1');
    });

    // --- 準正常系 ---

    it('ID が空文字の場合は取得しない', () => {
        const { result } = renderHook(() => useBlog(''), { wrapper: createWrapper() });

        expect(fetchBlogById).not.toHaveBeenCalled();
        expect(result.current.blog).toBeUndefined();
    });

    // --- 異常系 ---

    it('取得に失敗した場合は isError が true になり blog は undefined のまま', async () => {
        vi.mocked(fetchBlogById).mockRejectedValue(new Error('ブログの取得に失敗しました'));

        const { result } = renderHook(() => useBlog('blog-1'), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.blog).toBeUndefined();
    });
});
