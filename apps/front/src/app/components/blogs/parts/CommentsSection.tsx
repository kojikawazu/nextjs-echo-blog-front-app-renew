'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// hooks
import { useComments } from '@/app/hooks/useComments';
// schema
import { blogCommentSchema, BlogCommentFormValues } from '@/app/schema/blogCommentSchema';
// components
import { CommentsListComp } from '@/app/components/blogs/parts/CommentsListComp';

interface CommentSectionProps {
    blogId: string;
}

/**
 * コメントリストセクション
 * @param blogId ブログID
 * @returns JSX.Element
 */
export function CommentsSection({ blogId }: CommentSectionProps) {
    // hooks
    const { comments, isLoading, isError, addCommentMutation } = useComments(blogId);

    // コメントフォーム
    const { register, handleSubmit } = useForm<BlogCommentFormValues>({
        resolver: zodResolver(blogCommentSchema),
    });

    // コメント作成
    const handleCommentCreate = (data: BlogCommentFormValues) => {
        addCommentMutation.mutate({
            blog_id: blogId,
            guest_user: data.guest_user || '',
            comment: data.comment || '',
            id: '',
            created_at: '',
        });
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">コメント</h3>

            <form onSubmit={handleSubmit(handleCommentCreate)} className="mb-12">
                <div className="mb-6">
                    <label
                        htmlFor="guestName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        名前
                    </label>
                    <input
                        type="text"
                        id="guestName"
                        {...register('guest_user')}
                        className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        コメント
                    </label>
                    <textarea
                        id="comment"
                        {...register('comment')}
                        rows={4}
                        className="w-full px-6 py-4 bg-sky-50 border border-sky-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-3 px-6 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 font-medium transition-colors"
                    disabled={addCommentMutation.isPending}
                >
                    {addCommentMutation.isPending ? '送信中...' : 'コメントを送信'}
                </button>
            </form>

            <CommentsListComp comments={comments} isLoading={isLoading} isError={isError} />
        </div>
    );
}
