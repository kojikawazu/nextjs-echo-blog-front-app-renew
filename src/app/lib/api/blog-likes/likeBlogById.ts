import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * いいね登録
 * @param blogId ブログID
 * @returns ブログID
 */
export async function likeBlogById(blogId: string) {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_LIKE_CREATE.replace(':blogId', blogId)}`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_LIKE.TOAST_LIKE_BLOG_ERROR);
    }

    return blogId;
}
