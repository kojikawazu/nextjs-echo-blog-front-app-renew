// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * コメントを取得
 * @param blogId ブログID
 * @returns コメントリスト
 */
export async function fetchComments(blogId: string) {
    try {
        const response = await fetch(
            `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.COMMENTS_BLOG.replace(':blogId', blogId)}`,
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        if (!response.ok) {
            throw new Error(COMMON_CONSTANTS.BLOG_COMMENTS.TOAST_FETCH_COMMENTS_ERROR);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error(COMMON_CONSTANTS.BLOG_COMMENTS.TOAST_FETCH_COMMENTS_ERROR);
    }
}
