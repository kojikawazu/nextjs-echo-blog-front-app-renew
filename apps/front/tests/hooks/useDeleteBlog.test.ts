import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';
import { useDeleteBlog } from '@/app/hooks/useDeleteBlog';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

// 外部 I/O（API 通信）と、テスト環境に存在しない画面側の副作用（ルーター・トースト）のみモックする
vi.mock('@/app/lib/api/deleteBlogById');
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { deleteBlogById } from '@/app/lib/api/deleteBlogById';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDeleteBlog', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('成功時は API に渡して成功トーストを出し、ホームへ遷移する', async () => {
        // フックは戻り値を使わない（成功したかだけを見る）ため、空オブジェクトで API の戻り値型に合わせる
        vi.mocked(deleteBlogById).mockResolvedValue(
            {} as Awaited<ReturnType<typeof deleteBlogById>>,
        );

        const { result } = renderHook(() => useDeleteBlog('blog-1'), { wrapper: createWrapper() });
        act(() => {
            result.current.deleteBlog();
        });

        await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
        expect(deleteBlogById).toHaveBeenCalledWith('blog-1');
        expect(toast.success).toHaveBeenCalledWith(
            COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_SUCCESS,
        );
        expect(push).toHaveBeenCalledWith(COMMON_CONSTANTS.LINK.HOME);
        expect(toast.error).not.toHaveBeenCalled();
    });

    // --- 準正常系 ---

    it('送信中は isPending が true になる', async () => {
        vi.mocked(deleteBlogById).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useDeleteBlog('blog-1'), { wrapper: createWrapper() });
        expect(result.current.isPending).toBe(false);
        act(() => {
            result.current.deleteBlog();
        });

        await waitFor(() => expect(result.current.isPending).toBe(true));
    });

    // --- 異常系 ---

    it('失敗時はエラートーストを出し、遷移しない', async () => {
        vi.mocked(deleteBlogById).mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() => useDeleteBlog('blog-1'), { wrapper: createWrapper() });
        act(() => {
            result.current.deleteBlog();
        });

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_ERROR,
            ),
        );
        expect(toast.success).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();
        expect(result.current.isPending).toBe(false);
    });
});
