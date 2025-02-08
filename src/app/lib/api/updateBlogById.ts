// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// schema
import { BlogEditFormValues } from '@/app/schema/blogSchema';

/**
 * ブログを更新
 * @param blogId ブログID
 * @param updatedData 更新データ
 * @returns 更新データ
 */
export async function updateBlogById(blogId: string, updatedData: BlogEditFormValues) {
    const response = await fetch(
        `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_UPDATE_BY_ID.replace(':id', blogId)}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                title: updatedData.title,
                description: updatedData.description,
                category: updatedData.category,
                tags: updatedData.tags,
                githubUrl: updatedData.github_url,
            }),
        },
    );

    if (!response.ok) {
        throw new Error('ブログの更新に失敗しました');
    }

    return response.json();
}
