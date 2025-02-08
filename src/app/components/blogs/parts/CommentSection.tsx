import React, { useState } from 'react';
import { useCommentStore } from '@/app/stores/commentStores';
import type { Comment } from '@/app/types/blogs';

interface CommentSectionProps {
    blogId: string;
}

/**
 * コメントセクション
 * @param blogId ブログID
 * @returns JSX.Element
 */
export function CommentSection({ blogId }: CommentSectionProps) {
    const { comments, addComment } = useCommentStore();
    const [guestName, setGuestName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const blogComments = comments.filter((c) => c.blog_id === blogId);
    const parentComments = blogComments.filter((c) => !c.parent_id);
    const childComments = blogComments.filter((c) => c.parent_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !commentText.trim()) return;

        addComment({
            blog_id: blogId,
            guest_user: guestName,
            comment: commentText,
            parent_id: replyTo!,
        });

        setGuestName('');
        setCommentText('');
        setReplyTo(null);
    };

    const renderComment = (comment: Comment) => {
        const replies = childComments.filter((c) => c.parent_id === comment.id);

        return (
            <div key={comment.id} className="mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-gray-900">{comment.guest_user}</div>
                        <div className="text-sm text-sky-700 bg-sky-50 rounded-full px-3 py-1">
                            {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                        </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                    <button
                        onClick={() => setReplyTo(comment.id)}
                        className="mt-4 text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                        返信
                    </button>
                </div>

                {replies.length > 0 && (
                    <div className="ml-8 mt-4 space-y-4">
                        {replies.map((reply) => (
                            <div
                                key={reply.id}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="font-bold text-gray-900">
                                        {reply.guest_user}
                                    </div>
                                    <div className="text-sm text-sky-700 bg-sky-50 rounded-full px-3 py-1">
                                        {new Date(reply.created_at).toLocaleDateString('ja-JP')}
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{reply.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">コメント</h3>

            <form onSubmit={handleSubmit} className="mb-12">
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
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {replyTo ? '返信を入力' : 'コメントを入力'}
                    </label>
                    <textarea
                        id="comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                        className="w-full px-6 py-4 bg-sky-50 border border-sky-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        required
                    />
                </div>

                {replyTo && (
                    <button
                        type="button"
                        onClick={() => setReplyTo(null)}
                        className="mb-4 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                        返信をキャンセル
                    </button>
                )}

                <button
                    type="submit"
                    className="w-full py-3 px-6 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 font-medium transition-colors"
                >
                    {replyTo ? '返信を送信' : 'コメントを送信'}
                </button>
            </form>

            <div className="space-y-6">{parentComments.map(renderComment)}</div>
        </div>
    );
}
