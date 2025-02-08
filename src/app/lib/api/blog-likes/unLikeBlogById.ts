import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * いいねを削除
 * @param blogId ブログID
 * @returns ブログID
 */
export async function unlikeBlogById(blogId: string) {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_LIKE_DELETE.replace(':blogId', blogId)}`,
        {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    if (!response.ok) {
        throw new Error('いいねの取り消しに失敗しました');
    }

    return blogId;
}
