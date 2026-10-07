'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// lib
import { createBlog as createBlogApi } from '@/app/lib/api/createBlog';
// schema
import type { BlogCreateFormValues } from '@/app/schema/blogSchema';

/** ブログ作成操作。 */
type UseCreateBlogResult = {
    /** 記事を作成する。成功時は成功トーストを出してホームへ遷移、失敗時はエラートーストを出す */
    createBlog: (values: BlogCreateFormValues) => void;
    /** 作成リクエスト送信中か。送信ボタンの多重押下防止に使う */
    isPending: boolean;
};

/**
 * ブログ記事の作成を扱う。通知（トースト）と作成後の遷移までをこのフックが担う。
 *
 * @returns 作成関数と送信中フラグ
 */
export function useCreateBlog(): UseCreateBlogResult {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (values: BlogCreateFormValues) => createBlogApi(values),
        onSuccess: () => {
            toast.success(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_SUCCESS);
            router.push(COMMON_CONSTANTS.LINK.HOME);
        },
        onError: () => {
            toast.error(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR);
        },
    });

    return { createBlog: mutation.mutate, isPending: mutation.isPending };
}
