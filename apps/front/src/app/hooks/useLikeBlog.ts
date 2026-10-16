'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// lib
import { fetchLikedBlogs } from '@/app/lib/api/blog-likes/fetchLikedBlogs';
import { likeBlogById } from '@/app/lib/api/blog-likes/likeBlogById';
import { unlikeBlogById } from '@/app/lib/api/blog-likes/unLikeBlogById';
import { generateVisitId } from '@/app/lib/api/blog-likes/generateVisitId';

/** {@link useLikeBlog} の戻り値。 */
type UseLikeBlogResult = {
    /** ブログにいいねする。成功するといいね済み一覧とブログ一覧を再取得する */
    likeBlog: (blogId: string) => void;
    /** ブログのいいねを取り消す。成功するといいね済み一覧とブログ一覧を再取得する */
    unlikeBlog: (blogId: string) => void;
    /**
     * 現在の訪問者がそのブログにいいね済みかを返す。
     * 訪問者 ID の発行前・いいね済み一覧の取得前や、それらに失敗したときは常に `false`
     */
    hasLiked: (blogId: string) => boolean;
};

/**
 * 訪問者 ID を発行する。発行した ID は Cookie（`visit-id-token`）としてブラウザが保持するため、
 * 戻り値は使わない。
 *
 * @returns 発行が済んだことを表す `true`
 */
const ensureVisitId = async (): Promise<true> => {
    // generateVisitId の戻り値は実レスポンスに `visitId` が無く `undefined` になる。
    // TanStack Query は `undefined` を返すクエリをエラーにするため、`true` を返す
    await generateVisitId();
    return true;
};

/**
 * いいね機能のカスタムフック。訪問者 ID の発行・いいね済み一覧の取得・いいね登録/取消を提供する。
 * いいね済み一覧は、訪問者 ID の発行が終わってから取得する（Cookie の無い取得は 401 になるため・#159）。
 *
 * @returns いいね操作関数といいね判定関数
 */
export function useLikeBlog(): UseLikeBlogResult {
    const queryClient = useQueryClient();

    // 訪問者IDを発行。Cookie の有効期限は 1 時間で、期限内の再発行はバックエンドが何もしない。
    // 長く開いたタブでも失効後に発行し直せるよう、staleTime は既定（マウントごとに発行）のままにする。
    // フォーカスのたびに発行 API を呼ばないよう、フォーカス時の再取得は止める
    const visitIdQuery = useQuery({
        queryKey: ['visitId'],
        queryFn: ensureVisitId,
        refetchOnWindowFocus: false,
    });

    // いいね済みの記事を取得（訪問者IDの発行が終わってから）
    const { data: likedPosts = [] } = useQuery({
        queryKey: ['likedBlogs'],
        queryFn: fetchLikedBlogs,
        enabled: visitIdQuery.isSuccess,
    });

    /**
     * いいね登録
     */
    const likeMutation = useMutation({
        mutationFn: (blogId: string) => likeBlogById(blogId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    /**
     * いいね取り消し
     */
    const unlikeMutation = useMutation({
        mutationFn: (blogId: string) => unlikeBlogById(blogId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    const hasLiked = (blogId: string) => likedPosts.includes(blogId);

    return {
        likeBlog: likeMutation.mutate,
        unlikeBlog: unlikeMutation.mutate,
        hasLiked,
    };
}
