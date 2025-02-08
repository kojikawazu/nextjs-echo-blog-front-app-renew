import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 訪問者IDを生成
 */
export async function generateVisitId(): Promise<string> {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_LIKE_GENERATE_VISIT_ID}`,
        {
            method: 'GET',
            credentials: 'include',
        },
    );

    if (!response.ok) {
        throw new Error('訪問者IDの生成に失敗しました');
    }

    const data = await response.json();
    return data.visitId;
}
