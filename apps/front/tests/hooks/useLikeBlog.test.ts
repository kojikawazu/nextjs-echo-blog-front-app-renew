import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLikeBlog } from '@/app/hooks/useLikeBlog';

vi.mock('@/app/lib/api/blog-likes/fetchLikedBlogs');
vi.mock('@/app/lib/api/blog-likes/likeBlogById');
vi.mock('@/app/lib/api/blog-likes/unLikeBlogById');
vi.mock('@/app/lib/api/blog-likes/generateVisitId');

import { fetchLikedBlogs } from '@/app/lib/api/blog-likes/fetchLikedBlogs';
import { likeBlogById } from '@/app/lib/api/blog-likes/likeBlogById';
import { unlikeBlogById } from '@/app/lib/api/blog-likes/unLikeBlogById';
import { generateVisitId } from '@/app/lib/api/blog-likes/generateVisitId';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLikeBlog', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('should return hasLiked=true for a blog that is already liked', async () => {
        vi.mocked(generateVisitId).mockResolvedValue(undefined);
        vi.mocked(fetchLikedBlogs).mockResolvedValue(['blog-1', 'blog-3']);

        const { result } = renderHook(() => useLikeBlog(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));
        expect(result.current.hasLiked('blog-2')).toBe(false);
    });

    it('should return hasLiked=false for a blog that is not liked', async () => {
        vi.mocked(generateVisitId).mockResolvedValue(undefined);
        vi.mocked(fetchLikedBlogs).mockResolvedValue(['blog-1']);

        const { result } = renderHook(() => useLikeBlog(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));
        expect(result.current.hasLiked('blog-99')).toBe(false);
    });

    it('should call likeBlogById when likeBlog is invoked', async () => {
        vi.mocked(generateVisitId).mockResolvedValue(undefined);
        vi.mocked(fetchLikedBlogs).mockResolvedValue([]);
        vi.mocked(likeBlogById).mockResolvedValue(undefined);

        const { result } = renderHook(() => useLikeBlog(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(false));

        await act(async () => {
            result.current.likeBlog('blog-1');
            await waitFor(() => expect(likeBlogById).toHaveBeenCalledWith('blog-1'));
        });
    });

    it('should call unlikeBlogById when unlikeBlog is invoked', async () => {
        vi.mocked(generateVisitId).mockResolvedValue(undefined);
        vi.mocked(fetchLikedBlogs).mockResolvedValue(['blog-1']);
        vi.mocked(unlikeBlogById).mockResolvedValue(undefined);

        const { result } = renderHook(() => useLikeBlog(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));

        await act(async () => {
            result.current.unlikeBlog('blog-1');
            await waitFor(() => expect(unlikeBlogById).toHaveBeenCalledWith('blog-1'));
        });
    });

    // --- 準正常系 ---

    it('should return hasLiked=false when fetchLikedBlogs fails', async () => {
        vi.mocked(generateVisitId).mockResolvedValue(undefined);
        vi.mocked(fetchLikedBlogs).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useLikeBlog(), {
            wrapper: createWrapper(),
        });

        await new Promise((r) => setTimeout(r, 100));

        expect(result.current.hasLiked('blog-1')).toBe(false);
    });
});
