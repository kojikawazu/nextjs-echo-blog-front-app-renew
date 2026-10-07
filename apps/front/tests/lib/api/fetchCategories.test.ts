import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchCategories } from '@/app/lib/api/fetchCategories';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、エラー判定は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('fetchCategories', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('カテゴリ名の配列を返す', async () => {
        mockFetch(async () => ['tech', 'life']);

        await expect(fetchCategories()).resolves.toEqual(['tech', 'life']);
        expect(global.fetch).toHaveBeenCalledWith(COMMON_CONSTANTS.URL.BLOG_CATEGORIES);
    });

    // --- 準正常系 ---

    it('エラーステータスの場合はエラー本文を返さず例外を投げる', async () => {
        mockFetch(async () => ({ error: 'internal' }), false);

        await expect(fetchCategories()).rejects.toThrow(
            COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR,
        );
    });

    // --- 異常系 ---

    it('ネットワーク障害は例外をそのまま伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

        await expect(fetchCategories()).rejects.toThrow('Failed to fetch');
    });

    it('JSON パースに失敗した場合は例外を伝播する', async () => {
        mockFetch(async () => {
            throw new SyntaxError('Unexpected token');
        });

        await expect(fetchCategories()).rejects.toThrow(SyntaxError);
    });
});
