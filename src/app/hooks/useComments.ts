'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// lib
import { fetchComments } from '@/app/lib/api/blog-comments/fetchComments';
import { addComment } from '@/app/lib/api/blog-comments/addComment';
// types
import type { Comment } from '@/app/types/blogs';

/**
 * コメント機能のカスタムフック
 * @param blogId ブログID
 * @returns コメントリスト
 */
export function useComments(blogId: string) {
    const queryClient = useQueryClient();

    // コメントデータを取得
    const { data, isLoading, isError } = useQuery({
        queryKey: ['comments', blogId],
        queryFn: () => fetchComments(blogId),
        enabled: !!blogId,
    });

    // コメントを追加
    const addCommentMutation = useMutation({
        mutationFn: (newComment: Comment) => addComment(newComment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
        },
    });

    return {
        comments: data || [],
        isLoading,
        isError,
        addCommentMutation,
    };
}
