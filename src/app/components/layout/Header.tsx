'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, User } from 'lucide-react';
// context
import { useAuth } from '@/app/contexts/AuthContext';

/**
 * ヘッダー
 * @returns JSX.Element
 */
export function Header() {
    // context
    const { user, signOut } = useAuth();

    return (
        <header className="bg-white border-b border-sky-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <BookOpen className="h-8 w-8 text-sky-500 group-hover:text-sky-600 transition-colors" />
                        <h1 className="text-2xl font-bold text-gray-900">TechBlog</h1>
                    </Link>

                    <nav className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-sky-500 transition-colors"
                        >
                            記事一覧
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    href="/new"
                                    className="text-gray-600 hover:text-sky-500 transition-colors"
                                >
                                    新規投稿
                                </Link>
                                <div className="flex items-center space-x-6">
                                    <span className="text-sm text-gray-600">{user.name}</span>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-gray-600 hover:text-sky-500 transition-colors"
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                            >
                                <User className="h-5 w-5" />
                                <span>ログイン</span>
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
