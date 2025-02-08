'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PulseLoader } from 'react-spinners';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// contexts
import { useAuth } from '@/app/contexts/AuthContext';
// schema
import { blogCreateSchema, BlogCreateFormValues } from '@/app/schema/blogSchema';
// api
import { createBlog } from '@/app/lib/api/createBlog';
// components
import { ConfirmModal } from '@/app/components/common/modal/ConfirmModal';

/**
 * 新規記事作成フォーム
 * @returns JSX.Element
 */
export default function NewPost() {
    // router
    const router = useRouter();
    // contexts
    const { user, isLoading: isUserLoading } = useAuth();
    // states
    const [formValues, setFormValues] = useState<BlogCreateFormValues | null>(null);
    const [isConfirmCreateModalOpen, setIsConfirmCreateModalOpen] = useState(false);

    useEffect(() => {
        if (isUserLoading) {
            return;
        }
        // エラーハンドリング
        if (user === null) {
            router.push(COMMON_CONSTANTS.LINK.HOME);
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

    // 作成用のミューテーション
    const createMutation = useMutation({
        mutationFn: (createdData: BlogCreateFormValues) => createBlog(createdData),
        onSuccess: () => {
            toast.success(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_SUCCESS);
            router.push(COMMON_CONSTANTS.LINK.HOME);
        },
        onError: () => {
            toast.error(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR);
        },
    });

    // 作成確認モーダルの表示
    const handleConfirmCreate = (data: BlogCreateFormValues) => {
        setFormValues(data);
        setIsConfirmCreateModalOpen(true);
    };

    // 作成処理
    const onSubmit = () => {
        if (formValues) {
            createMutation.mutate({
                title: formValues?.title,
                description: formValues?.description,
                category: formValues?.category,
                tags: formValues?.tags,
                github_url: formValues?.github_url,
            });
        }
        setIsConfirmCreateModalOpen(false);
    };

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
                    <form onSubmit={handleSubmit(handleConfirmCreate)} className="space-y-6">
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

            <ConfirmModal
                isOpen={isConfirmCreateModalOpen}
                title="記事の作成"
                message="本当にこの記事を作成しますか？"
                confirmText="作成"
                cancelText="キャンセル"
                onConfirm={onSubmit}
                onCancel={() => setIsConfirmCreateModalOpen(false)}
                btnClassName="bg-indigo-600 hover:bg-indigo-700"
            />
        </div>
    );
}
