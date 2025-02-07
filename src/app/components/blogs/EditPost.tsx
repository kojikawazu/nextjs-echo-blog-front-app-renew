'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStores';
import { useBlogStore } from '@/app/stores/blogStores';

/**
 * 記事編集フォーム
 * @returns JSX.Element
 */
export default function EditPost() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const { blogs, updateBlog, deleteBlog } = useBlogStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    useEffect(() => {
        const blog = blogs.find((b) => b.id === id);
        if (!blog) {
            router.push('/');
            return;
        }

        if (!user || user.id !== blog.user_id) {
            router.push('/login');
            return;
        }

        setTitle(blog.title);
        setDescription(blog.description);
        setCategory(blog.category);
        setTags(blog.tags.join(', '));
        setGithubUrl(blog.github_url || '');
    }, [id, blogs, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;

        updateBlog(id, {
            title,
            description,
            category,
            tags: tags.split(',').map((tag) => tag.trim()),
            github_url: githubUrl || undefined,
        });

        router.push(`/blog/${id}`);
    };

    const handleDelete = () => {
        if (!id) return;

        if (window.confirm('本当にこの記事を削除しますか？')) {
            deleteBlog(id);
            router.push('/');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">記事の編集</h1>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                    >
                        削除
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            タイトル
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            本文
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            カテゴリー
                        </label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            タグ（カンマ区切り）
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="React, TypeScript, Web Development"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="githubUrl"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            GitHub URL（オプション）
                        </label>
                        <input
                            type="url"
                            id="githubUrl"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        更新
                    </button>
                </form>
            </div>
        </div>
    );
}
