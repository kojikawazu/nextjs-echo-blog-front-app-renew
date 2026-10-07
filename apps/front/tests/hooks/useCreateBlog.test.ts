import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';
import { useCreateBlog } from '@/app/hooks/useCreateBlog';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

// 外部 I/O（API 通信）と、テスト環境に存在しない画面側の副作用（ルーター・トースト）のみモックする
vi.mock('@/app/lib/api/createBlog');
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { createBlog } from '@/app/lib/api/createBlog';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

const values = {
    title: 'タイトル',
    description: '本文',
    category: 'tech',
    tags: 'go, nextjs',
    github_url: 'https://github.com/owner/repo/blob/main/a.md',
};

describe('useCreateBlog', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('成功時は API に渡して成功トーストを出し、ホームへ遷移する', async () => {
        // フックは戻り値を使わない（成功したかだけを見る）ため、空オブジェクトで API の戻り値型に合わせる
        vi.mocked(createBlog).mockResolvedValue({} as Awaited<ReturnType<typeof createBlog>>);

        const { result } = renderHook(() => useCreateBlog(), { wrapper: createWrapper() });
        act(() => {
            result.current.createBlog(values);
        });

        await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
        expect(createBlog).toHaveBeenCalledWith(values);
        expect(toast.success).toHaveBeenCalledWith(
            COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_SUCCESS,
        );
        expect(push).toHaveBeenCalledWith(COMMON_CONSTANTS.LINK.HOME);
        expect(toast.error).not.toHaveBeenCalled();
    });

    // --- 準正常系 ---

    it('送信中は isPending が true になる', async () => {
        vi.mocked(createBlog).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useCreateBlog(), { wrapper: createWrapper() });
        expect(result.current.isPending).toBe(false);
        act(() => {
            result.current.createBlog(values);
        });

        await waitFor(() => expect(result.current.isPending).toBe(true));
    });

    // --- 異常系 ---

    it('失敗時はエラートーストを出し、遷移しない', async () => {
        vi.mocked(createBlog).mockRejectedValue(new Error('API error'));

        const { result } = renderHook(() => useCreateBlog(), { wrapper: createWrapper() });
        act(() => {
            result.current.createBlog(values);
        });

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR,
            ),
        );
        expect(toast.success).not.toHaveBeenCalled();
        expect(push).not.toHaveBeenCalled();
        expect(result.current.isPending).toBe(false);
    });
});
