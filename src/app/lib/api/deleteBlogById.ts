// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * ブログを削除
 * @param blogId ブログID
 * @returns 削除データ
 */
export async function deleteBlogById(blogId: string) {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_DELETE_BY_ID.replace(':id', blogId)}`,
        {
            method: 'DELETE',
            credentials: 'include',
        },
    );

    if (!response.ok) {
        throw new Error('ブログの削除に失敗しました');
    }

    return response.json();
}
