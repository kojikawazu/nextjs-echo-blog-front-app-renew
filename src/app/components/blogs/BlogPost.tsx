'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ThumbsUp, Tag } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ReactMarkdown from 'react-markdown';
import { CommentSection } from '@/app/components/blogs/parts/CommentSection';
import { useBlogStore } from '@/app/stores/blogStores';
import { useAuthStore } from '@/app/stores/authStores';

interface BlogPostProps {
    id: string;
}

/**
 * ブログポスト
 * @param id ブログID
 * @returns JSX.Element
 */
export function BlogPost({ id }: BlogPostProps) {
    const { blogs, likeBlog, unlikeBlog, hasLiked } = useBlogStore();
    const { user } = useAuthStore();
    const [blog, setBlog] = useState(blogs.find((b) => b.id === id));
    const isLiked = id ? hasLiked(id) : false;

    useEffect(() => {
        const found = blogs.find((b) => b.id === id);
        if (found) {
            setBlog(found);
        }
    }, [id, blogs]);

    if (!blog) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">記事が見つかりません</h2>
                <Link href="/" className="text-sky-600 hover:text-sky-700 font-medium">
                    記事一覧に戻る
                </Link>
            </div>
        );
    }

    const handleLike = () => {
        if (isLiked) {
            unlikeBlog(blog.id);
        } else {
            likeBlog(blog.id, user ? user.id : '');
        }
    };

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-sky-100">
            <div className="p-8">
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sky-700 bg-sky-50 rounded-full px-4 py-2">
                                <Calendar className="h-4 w-4" />
                                <time className="font-medium">
                                    {new Date(blog.created_at).toLocaleDateString('ja-JP')}
                                </time>
                            </div>
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-colors ${
                                    isLiked
                                        ? 'text-sky-600 bg-sky-50 hover:bg-sky-100'
                                        : 'text-gray-600 hover:text-sky-600 hover:bg-sky-50'
                                }`}
                            >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="font-medium">{blog.likes}</span>
                            </button>
                        </div>

                        {user && user.id === blog.user_id && (
                            <Link
                                href={`/edit/${blog.id}`}
                                className="px-6 py-2 bg-sky-50 text-sky-700 rounded-full hover:bg-sky-100 transition-colors font-medium"
                            >
                                編集
                            </Link>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{blog.title}</h1>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {blog.tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/tag/${tag}`}
                                className="flex items-center space-x-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-medium hover:bg-sky-100 transition-colors"
                            >
                                <Tag className="h-4 w-4" />
                                <span>{tag}</span>
                            </Link>
                        ))}
                    </div>

                    {blog.github_url && (
                        <a
                            href={blog.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-primary transition-colors"
                        >
                            <FontAwesomeIcon icon={faGithub} size="lg" />
                        </a>
                    )}
                </header>

                <div className="prose prose-sky max-w-none">
                    <ReactMarkdown>{blog.description}</ReactMarkdown>
                </div>

                <div className="mt-12 pt-12 border-t border-sky-100">
                    <CommentSection blogId={blog.id} />
                </div>
            </div>
        </article>
    );
}
