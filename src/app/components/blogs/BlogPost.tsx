'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// contexts
import { useAuth } from '@/app/contexts/AuthContext';
// lib
import { fetchBlogById } from '@/app/lib/api/fetchBlogById';
import { fetchMarkdown } from '@/app/lib/api/github/fetchGitHub';
// components
import { CommentsSection } from '@/app/components/blogs/parts/CommentsSection';
// css
import 'highlight.js/styles/atom-one-dark.css';
import '@/app/styles/markdown.css';

interface BlogPostProps {
    id: string;
}

/**
 * ブログポスト
 * @param id ブログID
 * @returns JSX.Element
 */
export function BlogPost({ id }: BlogPostProps) {
    // contexts
    const { user, isLoading: isAuthLoading } = useAuth();
    // states
    const [markdownData, setMarkdownData] = useState<string | null>(null);
    const [markdownStatus, setMarkdownStatus] = useState<'idle' | 'loading' | 'error' | 'done'>(
        'idle',
    );

    // ブログデータの取得
    const {
        data: blog,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['blog', id],
        queryFn: () => fetchBlogById(id),
        enabled: !!id,
    });

    // GitHubのURLからMarkdownデータを取得
    useEffect(() => {
        if (!blog || !blog.github_url) {
            return;
        }
        let cancelled = false;
        setMarkdownStatus('loading');
        (async () => {
            try {
                const content = await fetchMarkdown(blog.github_url);
                if (cancelled) return;
                if (content) {
                    setMarkdownData(content);
                    setMarkdownStatus('done');
                } else {
                    // 取得失敗（プロキシが null を返却。トークン失効・404 等）→ 無言の空白を避ける
                    setMarkdownStatus('error');
                }
            } catch {
                if (!cancelled) setMarkdownStatus('error');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [blog]);

    return (
        <article className="bg-white rounded-2xl shadow-sm border border-sky-100">
            <div className="p-8">
                {isLoading || isAuthLoading ? (
                    <div className="h-16 flex items-center justify-center h-screen">
                        <PulseLoader color="#dddddd" size={10} />
                    </div>
                ) : isError ? (
                    <div className="flex justify-center items-center h-screen">
                        <p className="text-gray-500 text-2xl">
                            {COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_ERROR}
                        </p>
                    </div>
                ) : !blog ? (
                    <div className="flex justify-center items-center h-screen">
                        <p className="text-gray-500 text-2xl">
                            {COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_NOT_FOUND}
                        </p>
                    </div>
                ) : (
                    <>
                        <header className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-sky-700 bg-sky-50 rounded-full px-4 py-2">
                                        <Calendar className="h-4 w-4" />
                                        <time className="font-medium">{blog.created_at}</time>
                                    </div>
                                </div>

                                {user && user.id === blog.user_id && (
                                    <Link
                                        href={COMMON_CONSTANTS.LINK.EDIT.replace(':id', blog.id)}
                                        className="px-6 py-2 bg-sky-50 text-sky-700 rounded-full hover:bg-sky-100 transition-colors font-medium"
                                    >
                                        編集
                                    </Link>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-6">{blog.title}</h1>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {blog.tags.map((tag: string) => (
                                    <div
                                        key={tag}
                                        className="flex items-center space-x-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-medium hover:bg-sky-100 transition-colors"
                                    >
                                        <Tag className="h-4 w-4" />
                                        <span>{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </header>

                        <div className="">{blog.description}</div>

                        {markdownStatus === 'loading' && (
                            <div className="h-16 flex items-center justify-center">
                                <PulseLoader color="#dddddd" size={10} />
                            </div>
                        )}

                        {markdownData && (
                            <ReactMarkdown
                                className="prose prose-sky max-w-none markdown-content"
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {markdownData}
                            </ReactMarkdown>
                        )}

                        {blog.github_url && markdownStatus === 'error' && (
                            <p className="text-gray-500">
                                本文を読み込めませんでした。
                                <a
                                    href={blog.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-700 underline ml-1"
                                >
                                    GitHub で記事を見る
                                </a>
                            </p>
                        )}

                        <div className="mt-12 pt-12 border-t border-sky-100">
                            <CommentsSection blogId={blog.id} />
                        </div>
                    </>
                )}
            </div>
        </article>
    );
}
