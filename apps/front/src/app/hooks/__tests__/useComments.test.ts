import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useComments } from '../useComments';
import type { Comment } from '@/app/types/blogs';

vi.mock('@/app/lib/api/blog-comments/fetchComments');
vi.mock('@/app/lib/api/blog-comments/addComment');

import { fetchComments } from '@/app/lib/api/blog-comments/fetchComments';
import { addComment } from '@/app/lib/api/blog-comments/addComment';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const mockComment: Comment = {
    id: 'c-1',
    blog_id: 'blog-1',
    guest_user: '太郎',
    comment: '良い記事でした',
    created_at: '2024-01-01T00:00:00Z',
};

describe('useComments', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('should fetch comments when blogId is provided', async () => {
        vi.mocked(fetchComments).mockResolvedValue([mockComment]);

        const { result } = renderHook(() => useComments('blog-1'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.comments).toHaveLength(1);
        expect(result.current.comments[0].comment).toBe('良い記事でした');
        expect(result.current.isError).toBe(false);
    });

    it('should call addComment when mutate is invoked', async () => {
        vi.mocked(fetchComments).mockResolvedValue([]);
        vi.mocked(addComment).mockResolvedValue(mockComment);

        const { result } = renderHook(() => useComments('blog-1'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        result.current.addCommentMutation.mutate(mockComment);

        await waitFor(() => expect(addComment).toHaveBeenCalledWith(mockComment));
    });

    // --- 準正常系 ---

    it('should not fetch when blogId is empty', async () => {
        const { result } = renderHook(() => useComments(''), {
            wrapper: createWrapper(),
        });

        await new Promise((r) => setTimeout(r, 50));

        expect(fetchComments).not.toHaveBeenCalled();
        expect(result.current.comments).toEqual([]);
    });

    it('should set isError to true when fetch fails', async () => {
        vi.mocked(fetchComments).mockRejectedValue(new Error('Server error'));

        const { result } = renderHook(() => useComments('blog-1'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
