'use client';

import React from 'react';
import Link from 'next/link';
import { Tag, Bookmark, Hash } from 'lucide-react';
// contexts
import { useGlobalData } from '@/app/contexts/GlobalContext';
/**
 * サイドバー
 * @returns JSX.Element
 */
export function Sidebar() {
    // contexts
    const { categories, tags, popularPosts } = useGlobalData();

    return (
        <aside className="w-full md:w-72 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4">
                    <Tag className="h-5 w-5 text-sky-500" />
                    <span>カテゴリー</span>
                </h2>
                <ul className="space-y-2">
                    {categories.map((category) => (
                        <li key={category}>
                            <Link
                                href={`/category/${category}`}
                                className="text-gray-600 hover:text-sky-500 transition-colors block py-1"
                            >
                                {category}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4">
                    <Bookmark className="h-5 w-5 text-sky-500" />
                    <span>人気記事</span>
                </h2>
                <ul className="space-y-4">
                    {popularPosts.map((post) => (
                        <li key={post.id}>
                            <Link href={`/blog/${post.id}`} className="group block">
                                <span className="text-gray-600 group-hover:text-sky-500 transition-colors line-clamp-2">
                                    {post.title}
                                </span>
                                <div className="text-sm text-sky-500 mt-1">
                                    ♥ {post.likes} likes
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-4">
                    <Hash className="h-5 w-5 text-sky-500" />
                    <span>タグ</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/tag/${tag}`}
                            className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
