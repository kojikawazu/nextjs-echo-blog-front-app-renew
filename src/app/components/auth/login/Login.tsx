'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// context
import { useAuth } from '@/app/contexts/AuthContext';
// schema
import { loginSchema, LoginFormValues } from '@/app/schema/authSchema';

/**
 * ログインフォーム
 * @returns JSX.Element
 */
export default function Login() {
    // context
    const { signIn, isLoading } = useAuth();
    // form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">ログイン</h1>

                <form
                    onSubmit={handleSubmit((data) => signIn(data.email, data.password))}
                    className="space-y-5"
                >
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
                            {...register('email')}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
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
                            {...register('password')}
                            className="w-full px-6 py-3 bg-sky-50 border border-sky-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-sky-500 text-white rounded-full hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 font-medium transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'ログイン中...' : 'ログイン'}
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
