import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// schemas
import { likedBlogsResponseSchema } from '@/app/schemas/blogLikes';

/**
 * 訪問者がいいね済みのブログ ID 一覧を取得する。訪問者 Cookie を BFF 経由で転送する。
 *
 * @returns いいね済みのブログ ID 一覧。0 件（バックエンドが `null` を返した場合を含む）は空配列
 * @throws {Error} エラーステータスが返った場合（メッセージは `TOAST_LIKE_BLOG_ERROR`）
 * @throws {z.ZodError} レスポンスが想定外の形（配列でない・`blog_id` 欠落等）の場合
 */
export async function fetchLikedBlogs(): Promise<string[]> {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOG_LIKE_FETCH_LIKED_BLOGS, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_LIKE.TOAST_LIKE_BLOG_ERROR);
    }

    const data: unknown = await response.json();
    // null（いいね 0 件）を空配列に正規化する。ここで落ちると TanStack Query が直前の
    // いいね済み一覧を保持したままになり、解除後もいいね済み表示が残る（#17）
    const likes = likedBlogsResponseSchema.parse(data) ?? [];
    return likes.map((like) => like.blog_id);
}
