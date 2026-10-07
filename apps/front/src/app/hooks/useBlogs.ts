'use client';

import { useQuery } from '@tanstack/react-query';
// lib
import { fetchBlogs } from '@/app/lib/api/fetchBlogs';

/** `fetchBlogs` が返す一覧データ（絞り込み・並び替え・ページング適用後）。 */
type BlogListData = Awaited<ReturnType<typeof fetchBlogs>>;

/** ブログ一覧の取得条件。値が変わるたびにクエリキーが変わり再取得される。 */
type UseBlogsParams = {
    /** 表示するページ番号（1 始まり）。0 以下では取得しない */
    page: number;
    /** 1 ページあたりの表示件数 */
    limit: number;
    /** 絞り込むタグ。`null` は「タグで絞り込まない」 */
    tag: string | null;
    /** 絞り込むカテゴリ。`null` は「カテゴリで絞り込まない」 */
    category: string | null;
    /** 並び順 */
    sortBy: 'newest' | 'popular';
    /** 検索語（デバウンス済みを渡す）。空文字は「検索しない」 */
    searchQuery: string;
};

/** ブログ一覧の取得状態。 */
type UseBlogsResult = {
    /** 取得結果。取得前・失敗時は `undefined` */
    data: BlogListData | undefined;
    /** 初回取得中か（キャッシュがない状態での取得中のみ true） */
    isLoading: boolean;
    /** 取得に失敗したか */
    isError: boolean;
};

/**
 * ブログ一覧を取得する。絞り込み・並び替え・ページングは `fetchBlogs` 側で行う。
 *
 * @param params - 取得条件（ページ・件数・タグ・カテゴリ・並び順・検索語）
 * @returns 一覧データと取得状態
 */
export function useBlogs(params: UseBlogsParams): UseBlogsResult {
    const { page, limit, tag, category, sortBy, searchQuery } = params;

    const { data, isLoading, isError } = useQuery({
        // キー構造は既存キャッシュとの互換のため移設前と同一に保つ
        queryKey: [
            'blogs',
            {
                selectedTag: tag,
                selectedCategory: category,
                sortBy,
                currentPage: page,
                debouncedSearchQuery: searchQuery,
            },
        ],
        queryFn: () =>
            fetchBlogs(page, limit, tag ?? undefined, category ?? undefined, sortBy, searchQuery),
        enabled: page > 0,
    });

    return { data, isLoading, isError };
}
