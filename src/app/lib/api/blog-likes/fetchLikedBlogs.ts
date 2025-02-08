import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 訪問者のいいねしたブログを取得
 * @returns いいね済みのブログID一覧
 */
export async function fetchLikedBlogs(): Promise<string[]> {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_LIKE_FETCH_LIKED_BLOGS}`,
        {
            method: 'GET',
            credentials: 'include',
        },
    );

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_LIKE.TOAST_LIKE_BLOG_ERROR);
    }

    const data = await response.json();
    return data.map((like: { blog_id: string }) => like.blog_id) || [];
}
