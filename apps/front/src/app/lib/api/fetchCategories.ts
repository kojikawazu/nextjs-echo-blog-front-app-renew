// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 全ブログのカテゴリ一覧を取得する（サイドバー表示用）。
 *
 * @returns カテゴリ名の配列
 * @throws {Error} エラーステータスが返った場合（メッセージは `FETCH_GLOBAL_DATA_ERROR`）
 */
export async function fetchCategories(): Promise<string[]> {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOG_CATEGORIES);

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR);
    }

    return response.json();
}
