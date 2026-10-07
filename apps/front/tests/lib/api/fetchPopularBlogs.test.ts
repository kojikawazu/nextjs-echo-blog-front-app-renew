import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchPopularBlogs } from '@/app/lib/api/fetchPopularBlogs';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、エラー判定は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('fetchPopularBlogs', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('件数をパスの :count に埋めて人気記事を取得する', async () => {
        mockFetch(async () => [{ id: 'b1', title: 'T', likes: 9 }]);

        await expect(fetchPopularBlogs(5)).resolves.toEqual([{ id: 'b1', title: 'T', likes: 9 }]);
        expect(global.fetch).toHaveBeenCalledWith('/api/blogs/popular/5');
    });

    // --- 準正常系 ---

    it('エラーステータスの場合はエラー本文を返さず例外を投げる', async () => {
        mockFetch(async () => ({ error: 'internal' }), false);

        await expect(fetchPopularBlogs(5)).rejects.toThrow(
            COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR,
        );
    });

    // --- 異常系 ---

    it('ネットワーク障害は例外をそのまま伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

        await expect(fetchPopularBlogs(5)).rejects.toThrow('Failed to fetch');
    });

    it('JSON パースに失敗した場合は例外を伝播する', async () => {
        mockFetch(async () => {
            throw new SyntaxError('Unexpected token');
        });

        await expect(fetchPopularBlogs(5)).rejects.toThrow(SyntaxError);
    });
});
