'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStores';
import { useBlogStore } from '@/app/stores/blogStores';

/**
 * 新規記事作成フォーム
 * @returns JSX.Element
 */
export default function NewPost() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { createBlog } = useBlogStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    if (!user) {
        router.push('/login');
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createBlog({
            user_id: user.id,
            title,
            description,
            category,
            tags: tags.split(',').map((tag) => tag.trim()),
            github_url: githubUrl || undefined,
        });

        router.push('/');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">新規記事作成</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            タイトル
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            本文
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={10}
                            className="w-full px-6 py-4 bg-sky-50 border border-sky-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            カテゴリー
                        </label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            タグ（カンマ区切り）
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="React, TypeScript, Web Development"
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="githubUrl"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            GitHub URL（オプション）
                        </label>
                        <input
                            type="url"
                            id="githubUrl"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 font-medium transition-colors"
                    >
                        投稿
                    </button>
                </form>
            </div>
        </div>
    );
}
