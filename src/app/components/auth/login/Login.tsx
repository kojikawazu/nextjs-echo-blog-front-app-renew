'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStores';

/**
 * ログインフォーム
 * @returns JSX.Element
 */
export default function Login() {
    const router = useRouter();
    const { signIn } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await signIn(email, password);
            router.push('/');
        } catch (err) {
            setError('メールアドレスまたはパスワードが正しくありません');
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">ログイン</h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            パスワード
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 font-medium transition-colors"
                    >
                        ログイン
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    アカウントをお持ちでない方は
                    <Link href="/register" className="text-sky-600 hover:text-sky-700 font-medium">
                        新規登録
                    </Link>
                    へ
                </p>
            </div>
        </div>
    );
}
