// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import { Blog } from '@/app/types/blogs';

/**
 * ブログを取得
 * @param page ページ番号
 * @param limit ブログの表示数
 * @param tag タグ
 * @param category カテゴリ
 * @returns ブログデータ
 */
export async function fetchBlogs(page: number, limit: number, tag?: string, category?: string) {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(tag && { tag }),
        ...(category && { category }),
    });

    const response = await fetch(COMMON_CONSTANTS.API_URL + COMMON_CONSTANTS.URL.BLOGS, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('ブログの取得に失敗しました');
    }

    const data = await response.json();
    const blogs = Array.isArray(data)
        ? data.map((blog) => ({
              id: blog.id,
              user_id: blog.user_id,
              title: blog.title,
              github_url: blog.github_url ?? '',
              category: blog.category,
              tags:
                  typeof blog.tags === 'string'
                      ? blog.tags.split(',').map((tag: string) => tag.trim())
                      : Array.isArray(blog.tags)
                        ? blog.tags
                        : [],
              description: blog.description,
              likes: blog.likes ?? 0,
              created_at: new Date(blog.created_at).toLocaleDateString('ja-JP'),
              updated_at: new Date(blog.updated_at).toLocaleDateString('ja-JP'),
          }))
        : [];

    // ページごとのデータを取得
    const startIndex = (page - 1) * limit;
    const paginatedBlogs = blogs.slice(startIndex, startIndex + limit);

    const totalPages = Math.ceil(blogs.length / limit);

    return {
        blogs: paginatedBlogs,
        totalPages: totalPages || 1,
    };
}
