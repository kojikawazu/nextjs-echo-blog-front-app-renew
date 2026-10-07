// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 全ブログのタグ一覧を取得する（サイドバー表示用）。
 *
 * @returns タグ名の配列
 * @throws {Error} エラーステータスが返った場合（メッセージは `FETCH_GLOBAL_DATA_ERROR`）
 */
export async function fetchTags(): Promise<string[]> {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOG_TAGS);

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR);
    }

    return response.json();
}
