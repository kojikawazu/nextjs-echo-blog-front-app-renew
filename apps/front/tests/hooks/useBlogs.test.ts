import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBlogs } from '@/app/hooks/useBlogs';

vi.mock('@/app/lib/api/fetchBlogs');

import { fetchBlogs } from '@/app/lib/api/fetchBlogs';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const listData = {
    blogs: [],
    allCategories: ['tech'],
    allTags: ['go'],
    totalPages: 1,
};

const baseParams = {
    page: 1,
    limit: 10,
    tag: null,
    category: null,
    sortBy: 'newest' as const,
    searchQuery: '',
};

describe('useBlogs', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('取得条件を fetchBlogs に渡し、結果を data として返す', async () => {
        // fetchBlogs の戻り値型は整形後の Blog 配列を含む推論型。テストでは空配列の一覧で十分なため二段キャストで合わせる
        vi.mocked(fetchBlogs).mockResolvedValue(
            listData as unknown as Awaited<ReturnType<typeof fetchBlogs>>,
        );

        const { result } = renderHook(
            () =>
                useBlogs({
                    ...baseParams,
                    tag: 'go',
                    category: 'tech',
                    sortBy: 'popular',
                    searchQuery: 'q',
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.data).toEqual(listData);
        expect(result.current.isError).toBe(false);
        expect(fetchBlogs).toHaveBeenCalledWith(1, 10, 'go', 'tech', 'popular', 'q');
    });

    // --- 準正常系 ---

    it('タグ・カテゴリが null の場合は undefined（絞り込みなし）として渡す', async () => {
        vi.mocked(fetchBlogs).mockResolvedValue(
            listData as unknown as Awaited<ReturnType<typeof fetchBlogs>>,
        );

        renderHook(() => useBlogs(baseParams), { wrapper: createWrapper() });

        await waitFor(() => expect(fetchBlogs).toHaveBeenCalledTimes(1));
        expect(fetchBlogs).toHaveBeenCalledWith(1, 10, undefined, undefined, 'newest', '');
    });

    it('ページ番号が 0 以下の場合は取得しない', () => {
        const { result } = renderHook(() => useBlogs({ ...baseParams, page: 0 }), {
            wrapper: createWrapper(),
        });

        expect(fetchBlogs).not.toHaveBeenCalled();
        expect(result.current.data).toBeUndefined();
    });

    // --- 異常系 ---

    it('取得に失敗した場合は isError が true になり data は undefined のまま', async () => {
        vi.mocked(fetchBlogs).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useBlogs(baseParams), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.data).toBeUndefined();
    });
});
