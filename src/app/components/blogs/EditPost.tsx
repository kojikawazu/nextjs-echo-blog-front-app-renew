'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PulseLoader } from 'react-spinners';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// lib
import { fetchBlogById } from '@/app/lib/api/fetchBlogById';
import { updateBlogById } from '@/app/lib/api/updateBlogById';
import { deleteBlogById } from '@/app/lib/api/deleteBlogById';
// contexts
import { useAuth } from '@/app/contexts/AuthContext';
// schema
import { blogEditSchema, type BlogEditFormValues } from '@/app/schema/blogSchema';
// components
import { ConfirmModal } from '@/app/components/common/modal/ConfirmModal';

interface EditPostProps {
    id: string;
}

/**
 * 記事編集フォーム
 * @param props プロパティ
 * @returns JSX.Element
 */
export default function EditPost({ id }: EditPostProps) {
    // router
    const router = useRouter();
    // contexts
    const { user, isLoading: isUserLoading } = useAuth();
    // states
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // ブログデータを取得
    const {
        data: blog,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['blog', id],
        queryFn: () => fetchBlogById(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (isUserLoading || isLoading) {
            return;
        }
        // エラーハンドリング
        if (!isLoading && (isError || !blog)) {
            router.push('/');
        }
        if (user === null) {
            router.push('/login');
        }
        if (user && blog && user?.id !== blog?.user_id) {
            router.push('/login');
        }
    }, [isUserLoading, isError, blog, user, router]);

    // フォームの値
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BlogEditFormValues>({
        resolver: zodResolver(blogEditSchema),
    });

    // 更新処理
    const onSubmit = (data: BlogEditFormValues) => {
        updateMutation.mutate({
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags,
            github_url: data.github_url,
        });
    };

    // 更新用のミューテーション
    const updateMutation = useMutation({
        mutationFn: (updatedData: BlogEditFormValues) => updateBlogById(id, updatedData),
        onSuccess: () => {
            router.push(`/blog/${id}`);
        },
    });

    // 削除用のミューテーション
    const deleteMutation = useMutation({
        mutationFn: () => deleteBlogById(id),
        onSuccess: () => {
            router.push('/');
        },
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">記事の編集</h1>
                    <button
                        onClick={() => setIsConfirmModalOpen(true)}
                        className="px-4 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                    >
                        削除
                    </button>
                </div>

                {isUserLoading || isLoading ? (
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
                                defaultValue={blog?.title}
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
                                defaultValue={blog?.github_url}
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
                                defaultValue={blog?.category}
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
                                defaultValue={blog?.tags.join(', ')}
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
                                defaultValue={blog?.description}
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
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? '更新中...' : '更新'}
                        </button>
                    </form>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                title="記事の削除"
                message="本当にこの記事を削除しますか？"
                confirmText="削除"
                cancelText="キャンセル"
                onConfirm={() => {
                    deleteMutation.mutate();
                    setIsConfirmModalOpen(false);
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
}
