// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import type { Comment } from '@/app/types/blogs';

/**
 * コメントを追加
 * @param comment コメント
 * @returns コメント
 */
export async function addComment(comment: Comment) {
    try {
        const response = await fetch(
            `${COMMON_CONSTANTS.API_URL}${COMMON_CONSTANTS.URL.COMMENTS_CREATE}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    blogId: comment.blog_id,
                    guestUser: comment.guest_user,
                    comment: comment.comment,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(COMMON_CONSTANTS.BLOG_COMMENTS.TOAST_CREATE_COMMENT_ERROR);
        }

        return response.json();
    } catch (error) {
        console.error(error);
        throw new Error(COMMON_CONSTANTS.BLOG_COMMENTS.TOAST_CREATE_COMMENT_ERROR);
    }
}
