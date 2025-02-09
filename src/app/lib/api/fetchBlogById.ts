// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * ブログを取得
 * @param blogId ブログID
 * @returns ブログデータ
 */
export async function fetchBlogById(blogId: string) {
    const response = await fetch(
        COMMON_CONSTANTS.API_URL + COMMON_CONSTANTS.URL.BLOG_BY_ID.replace(':id', blogId),
        {
            method: 'GET',
            credentials: 'include',
        },
    );

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_ERROR);
    }

    const data = await response.json();
    return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        github_url: data.github_url ?? '',
        category: data.category,
        tags:
            typeof data.tags === 'string'
                ? data.tags.split(',').map((tag: string) => tag.trim())
                : Array.isArray(data.tags)
                  ? data.tags
                  : [],
        description: data.description,
        likes: data.likes ?? 0,
        comment_cnt: data.comment_cnt ?? 0,
        created_at: new Date(data.created_at).toLocaleDateString('ja-JP'),
        updated_at: new Date(data.updated_at).toLocaleDateString('ja-JP'),
    };
}
