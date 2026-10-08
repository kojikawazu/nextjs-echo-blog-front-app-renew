import { describe, it, expect, vi, afterEach } from 'vitest';
import { ZodError } from 'zod';
import { fetchLikedBlogs } from '@/app/lib/api/blog-likes/fetchLikedBlogs';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、レスポンス検証・ID 抽出は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('fetchLikedBlogs', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('いいね済み一覧からブログ ID だけを取り出して返す', async () => {
        mockFetch(async () => [
            { id: 'l1', blog_id: 'b1', visit_id: 'v' },
            { id: 'l2', blog_id: 'b2', visit_id: 'v' },
        ]);

        await expect(fetchLikedBlogs()).resolves.toEqual(['b1', 'b2']);
        expect(global.fetch).toHaveBeenCalledWith(
            COMMON_CONSTANTS.URL.BLOG_LIKE_FETCH_LIKED_BLOGS,
            { method: 'GET', credentials: 'include' },
        );
    });

    // --- 準正常系 ---

    it('null（バックエンドのいいね 0 件）は空配列として返す（#17）', async () => {
        mockFetch(async () => null);

        await expect(fetchLikedBlogs()).resolves.toEqual([]);
    });

    it('空配列は空配列のまま返す', async () => {
        mockFetch(async () => []);

        await expect(fetchLikedBlogs()).resolves.toEqual([]);
    });

    // --- 異常系 ---

    it('エラーステータスの場合はいいね失敗メッセージで例外を投げる', async () => {
        mockFetch(async () => ({ error: 'x' }), false);

        await expect(fetchLikedBlogs()).rejects.toThrow(
            COMMON_CONSTANTS.BLOG_LIKE.TOAST_LIKE_BLOG_ERROR,
        );
    });

    it('配列でないレスポンス（エラーオブジェクト等）は ZodError で弾く', async () => {
        mockFetch(async () => ({ error: 'unexpected' }));

        await expect(fetchLikedBlogs()).rejects.toThrow(ZodError);
    });

    it('blog_id を欠く要素を含む場合は ZodError で弾く（undefined を ID として返さない）', async () => {
        mockFetch(async () => [{ blog_id: 'b1' }, { id: 'l2' }]);

        await expect(fetchLikedBlogs()).rejects.toThrow(ZodError);
    });

    it('JSON パースに失敗した場合は例外を伝播する', async () => {
        mockFetch(async () => {
            throw new SyntaxError('Unexpected token');
        });

        await expect(fetchLikedBlogs()).rejects.toThrow(SyntaxError);
    });
});
