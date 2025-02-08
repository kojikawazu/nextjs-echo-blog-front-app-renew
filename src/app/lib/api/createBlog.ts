// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// schema
import { BlogCreateFormValues } from '@/app/schema/blogSchema';

/**
 * ブログを作成
 * @param createdData 作成データ
 * @returns 作成データ
 */
export async function createBlog(createdData: BlogCreateFormValues) {
    const response = await fetch(`${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.BLOG_CREATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            title: createdData.title,
            description: createdData.description,
            category: createdData.category,
            tags: createdData.tags,
            githubUrl: createdData.github_url,
        }),
    });

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR);
    }

    return response.json();
}
