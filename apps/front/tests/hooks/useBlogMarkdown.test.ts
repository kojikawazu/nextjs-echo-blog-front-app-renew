import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBlogMarkdown } from '@/app/hooks/useBlogMarkdown';

vi.mock('@/app/lib/api/github/fetchGitHub');

import { fetchMarkdown } from '@/app/lib/api/github/fetchGitHub';

const URL_A = 'https://github.com/owner/repo/blob/main/a.md';
const URL_B = 'https://github.com/owner/repo/blob/main/b.md';

describe('useBlogMarkdown', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    // --- 正常系 ---

    it('URL の Markdown を取得し、status が done になる', async () => {
        vi.mocked(fetchMarkdown).mockResolvedValue('# 本文');

        const { result } = renderHook(() => useBlogMarkdown(URL_A));

        await waitFor(() => expect(result.current.status).toBe('done'));
        expect(result.current.markdown).toBe('# 本文');
        expect(fetchMarkdown).toHaveBeenCalledWith(URL_A);
    });

    // --- 準正常系 ---

    it('URL が undefined の場合は取得せず idle のまま', () => {
        const { result } = renderHook(() => useBlogMarkdown(undefined));

        expect(fetchMarkdown).not.toHaveBeenCalled();
        expect(result.current).toEqual({ markdown: null, status: 'idle' });
    });

    it('プロキシが null を返した場合は status が error になり本文は null', async () => {
        vi.mocked(fetchMarkdown).mockResolvedValue(null);

        const { result } = renderHook(() => useBlogMarkdown(URL_A));

        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.markdown).toBeNull();
    });

    it('URL 変更前のリクエストが後から解決しても古い本文で上書きしない', async () => {
        let resolveA: (v: string) => void = () => {};
        vi.mocked(fetchMarkdown).mockImplementation((url: string) =>
            url === URL_A
                ? new Promise<string>((resolve) => {
                      resolveA = resolve;
                  })
                : Promise.resolve('# B'),
        );

        const { result, rerender } = renderHook(({ url }) => useBlogMarkdown(url), {
            initialProps: { url: URL_A },
        });
        rerender({ url: URL_B });
        await waitFor(() => expect(result.current.markdown).toBe('# B'));

        resolveA('# A（古い）');
        await new Promise((r) => setTimeout(r, 0));

        expect(result.current).toEqual({ markdown: '# B', status: 'done' });
    });

    // --- 異常系 ---

    it('通信エラーで例外が投げられた場合は status が error になる', async () => {
        vi.mocked(fetchMarkdown).mockRejectedValue(new Error('GitHub API Error'));

        const { result } = renderHook(() => useBlogMarkdown(URL_A));

        await waitFor(() => expect(result.current.status).toBe('error'));
        expect(result.current.markdown).toBeNull();
    });
});
