import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 訪問者ID（いいね重複防止用）を BFF 経由で生成・取得する。
 *
 * @returns 生成された訪問者 ID
 * @throws {Error} 生成 API がエラーステータスを返した場合
 */
export async function generateVisitId(): Promise<string> {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOG_LIKE_GENERATE_VISIT_ID, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_LIKE.TOAST_GENERATE_VISIT_ID_ERROR);
    }

    const data = await response.json();
    return data.visitId;
}
