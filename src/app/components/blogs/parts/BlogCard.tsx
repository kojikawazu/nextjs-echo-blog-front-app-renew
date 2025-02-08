import React from 'react';
import Link from 'next/link';
import { Calendar, ThumbsUp, MessageCircle } from 'lucide-react';
import type { Blog } from '@/app/types/blogs';
import { useCommentStore } from '@/app/stores/commentStores';
import { useBlogStore } from '@/app/stores/blogStores';

interface BlogCardProps {
    blog: Blog;
}

/**
 * ブログカード
 * @param blog ブログ
 * @returns JSX.Element
 */
export function BlogCard({ blog }: BlogCardProps) {
    const { comments } = useCommentStore();
    const { likeBlog, unlikeBlog, hasLiked } = useBlogStore();
    const commentCount = comments.filter((c) => c.blog_id === blog.id).length;
    const isLiked = hasLiked(blog.id);

    const handleLike = () => {
        if (isLiked) {
            unlikeBlog(blog.id);
        } else {
            likeBlog(blog.id, blog.user_id);
        }
    };

    return (
        <article className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 border border-gray-100">
            <div className="p-6">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <time>{new Date(blog.created_at).toLocaleDateString('ja-JP')}</time>
                    </div>

                    {blog.category && (
                        <div className="inline-flex items-center px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium hover:bg-sky-200 transition-colors">
                            {blog.category}
                        </div>
                    )}
                </div>

                <Link href={`/blog/${blog.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-sky-500 transition-colors">
                        {blog.title}
                    </h2>
                </Link>

                <p className="text-gray-600 mb-6 line-clamp-3">{blog.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-1 text-sm ${
                                isLiked ? 'text-sky-500' : 'text-gray-500 hover:text-sky-500'
                            } transition-colors`}
                        >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{blog.likes}</span>
                        </button>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            <span>{commentCount}</span>
                        </div>
                    </div>

                    {blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
