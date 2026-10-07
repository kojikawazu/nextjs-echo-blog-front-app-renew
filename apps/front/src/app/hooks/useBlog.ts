'use client';

import { useQuery } from '@tanstack/react-query';
// lib
import { fetchBlogById } from '@/app/lib/api/fetchBlogById';

/** `fetchBlogById` が返す記事詳細（表示用に整形済み）。 */
type BlogDetail = Awaited<ReturnType<typeof fetchBlogById>>;

/** ブログ記事 1 件の取得状態。 */
type UseBlogResult = {
    /** 記事詳細。取得前・失敗時・`id` 未指定時は `undefined` */
    blog: BlogDetail | undefined;
    /** 初回取得中か */
    isLoading: boolean;
    /** 取得に失敗したか（存在しない記事もバックエンドのエラーとしてここに含まれる） */
    isError: boolean;
};

/**
 * ブログ記事を 1 件取得する。詳細画面と編集画面で同じキャッシュ（`['blog', id]`）を共有する。
 *
 * @param id - 対象ブログの ID。空文字の場合は取得しない
 * @returns 記事詳細と取得状態
 */
export function useBlog(id: string): UseBlogResult {
    const {
        data: blog,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['blog', id],
        queryFn: () => fetchBlogById(id),
        enabled: !!id,
    });

    return { blog, isLoading, isError };
}
