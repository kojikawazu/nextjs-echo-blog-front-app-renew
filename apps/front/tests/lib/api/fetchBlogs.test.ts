import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchBlogs } from '@/app/lib/api/fetchBlogs';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * fetchBlogs は唯一の外部 I/O が global.fetch のため、fetch のみモックする。
 * ソート・フィルタ・データ変換などのビジネスロジックは実物を通して検証する。
 */
const mockFetchOnce = (body: unknown, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({
        ok,
        json: async () => body,
    }) as unknown as typeof fetch;
};

// バックエンドの生レスポンスを模した素データ
const rawBlog = (over: Record<string, unknown>) => ({
    id: 'id',
    user_id: 'u1',
    title: 'title',
    github_url: 'https://example.com',
    category: 'tech',
    tags: ['a'],
    description: 'desc',
    likes: 0,
    comment_cnt: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...over,
});

describe('fetchBlogs', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('newest ソートは同日でも時刻まで考慮して新しい順に並べる', async () => {
        // 同じ 2024-01-05 でも時刻が異なる 2 件 + 翌日 1 件
        mockFetchOnce([
            rawBlog({ id: 'same-day-morning', created_at: '2024-01-05T10:00:00Z' }),
            rawBlog({ id: 'next-day', created_at: '2024-01-06T09:00:00Z' }),
            rawBlog({ id: 'same-day-evening', created_at: '2024-01-05T18:00:00Z' }),
        ]);

        const result = await fetchBlogs(1, 10, undefined, undefined, 'newest');

        expect(result.blogs.map((b) => b.id)).toEqual([
            'next-day',
            'same-day-evening',
            'same-day-morning',
        ]);
    });

    it('popular ソートはいいね数の多い順に並べる', async () => {
        mockFetchOnce([
            rawBlog({ id: 'low', likes: 1 }),
            rawBlog({ id: 'high', likes: 99 }),
            rawBlog({ id: 'mid', likes: 50 }),
        ]);

        const result = await fetchBlogs(1, 10, undefined, undefined, 'popular');

        expect(result.blogs.map((b) => b.id)).toEqual(['high', 'mid', 'low']);
    });

    it('category と tag で絞り込み、全カテゴリ/全タグを返す', async () => {
        mockFetchOnce([
            rawBlog({ id: 'a', category: 'tech', tags: ['go', 'next'] }),
            rawBlog({ id: 'b', category: 'life', tags: ['diary'] }),
            rawBlog({ id: 'c', category: 'tech', tags: ['next'] }),
        ]);

        const result = await fetchBlogs(1, 10, 'next', 'tech', 'newest');

        // tech かつ next タグを持つ a, c のみ
        expect(result.blogs.map((b) => b.id).sort()).toEqual(['a', 'c']);
        // allCategories/allTags はフィルタ前の全件から算出
        expect(result.allCategories.sort()).toEqual(['life', 'tech']);
        expect(result.allTags.sort()).toEqual(['diary', 'go', 'next']);
    });

    // --- 準正常系（想定内の異常入力） ---

    it('tags が文字列でも配列に分割し、null フィールドは既定値で補完する', async () => {
        mockFetchOnce([
            rawBlog({
                id: 'x',
                tags: 'go, next , react',
                github_url: null,
                likes: null,
                comment_cnt: null,
            }),
        ]);

        const result = await fetchBlogs(1, 10);
        const blog = result.blogs[0];

        expect(blog.tags).toEqual(['go', 'next', 'react']);
        expect(blog.github_url).toBe('');
        expect(blog.likes).toBe(0);
        expect(blog.comment_cnt).toBe(0);
    });

    it('検索クエリに一致しない場合は空配列・totalPages=1 を返す', async () => {
        mockFetchOnce([rawBlog({ id: 'a', title: 'Go入門', description: 'desc', tags: ['go'] })]);

        const result = await fetchBlogs(
            1,
            10,
            undefined,
            undefined,
            'newest',
            'まったく一致しない語',
        );

        expect(result.blogs).toEqual([]);
        expect(result.totalPages).toBe(1);
    });

    it('ページネーション: limit を超える件数は指定ページ分だけ返す', async () => {
        const raw = Array.from({ length: 12 }, (_, i) => rawBlog({ id: `b${i}`, likes: 100 - i }));
        mockFetchOnce(raw);

        const page1 = await fetchBlogs(1, 10, undefined, undefined, 'popular');
        const page2 = await fetchBlogs(2, 10, undefined, undefined, 'popular');

        expect(page1.blogs).toHaveLength(10);
        expect(page2.blogs).toHaveLength(2);
        expect(page1.totalPages).toBe(2);
        // popular 順: 先頭は最もいいねの多い b0
        expect(page1.blogs[0].id).toBe('b0');
    });

    it('レスポンスが配列でない場合は空の結果を返す', async () => {
        mockFetchOnce({ message: 'unexpected' });

        const result = await fetchBlogs(1, 10);

        expect(result.blogs).toEqual([]);
        expect(result.totalPages).toBe(1);
        expect(result.allCategories).toEqual([]);
        expect(result.allTags).toEqual([]);
    });

    // --- 異常系（想定外のエラー） ---

    it('レスポンスが ok でない場合はエラーを投げる', async () => {
        mockFetchOnce([], false);

        await expect(fetchBlogs(1, 10)).rejects.toThrow(
            COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_ERROR,
        );
    });

    it('fetch 自体が失敗した場合は例外を伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new Error('Network down')) as unknown as typeof fetch;

        await expect(fetchBlogs(1, 10)).rejects.toThrow('Network down');
    });

    it('レスポンスの JSON パースが失敗した場合は例外を伝播する', async () => {
        // 想定外: response.ok だが body が壊れており json() が throw する
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => {
                throw new Error('Malformed JSON');
            },
        }) as unknown as typeof fetch;

        await expect(fetchBlogs(1, 10)).rejects.toThrow('Malformed JSON');
    });
});
