// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import type { PopularBlog } from '@/app/types/blogs';

/**
 * いいね数上位の人気記事を取得する（サイドバー表示用）。全ブログが対象。
 *
 * @param count - 取得件数（上位何件か）
 * @returns 人気記事の配列（いいね数の降順）
 * @throws {Error} エラーステータスが返った場合（メッセージは `FETCH_GLOBAL_DATA_ERROR`）
 */
export async function fetchPopularBlogs(count: number): Promise<PopularBlog[]> {
    const response = await fetch(
        COMMON_CONSTANTS.URL.BLOG_POPULAR.replace(':count', count.toString()),
    );

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR);
    }

    return response.json();
}
