'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from 'react-spinners';
import { useMutation } from '@tanstack/react-query';
// contexts
import { useAuth } from '@/app/contexts/AuthContext';
// schema
import { blogCreateSchema, BlogCreateFormValues } from '@/app/schema/blogSchema';
// api
import { createBlog } from '@/app/lib/api/createBlog';

/**
 * 新規記事作成フォーム
 * @returns JSX.Element
 */
export default function NewPost() {
    // router
    const router = useRouter();
    // contexts
    const { user, isLoading: isUserLoading } = useAuth();

    useEffect(() => {
        if (isUserLoading) {
            return;
        }
        // エラーハンドリング
        if (user === null) {
            router.push('/');
        }
    }, [isUserLoading, user, router]);

    // フォームの値
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BlogCreateFormValues>({
        resolver: zodResolver(blogCreateSchema),
    });

    // 作成処理
    const onSubmit = (data: BlogCreateFormValues) => {
        createMutation.mutate({
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags,
            github_url: data.github_url,
        });
    };

    // 作成用のミューテーション
    const createMutation = useMutation({
        mutationFn: (createdData: BlogCreateFormValues) => createBlog(createdData),
        onSuccess: () => {
            router.push('/');
        },
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">記事の作成</h1>
                </div>

                {isUserLoading ? (
                    <div className="h-16 flex items-center justify-center h-screen">
                        <PulseLoader color="#dddddd" size={10} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                {...register('title')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="github_url"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                GitHub URL
                            </label>
                            <input
                                type="text"
                                id="github_url"
                                {...register('github_url')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            {errors.github_url && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.github_url.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                カテゴリ
                            </label>
                            <input
                                type="text"
                                id="category"
                                {...register('category')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="tags"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                タグ
                            </label>
                            <input
                                type="text"
                                id="tags"
                                {...register('tags')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            {errors.tags && (
                                <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                内容
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? '作成中...' : '作成'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
