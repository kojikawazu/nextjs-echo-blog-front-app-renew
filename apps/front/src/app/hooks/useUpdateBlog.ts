'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// lib
import { updateBlogById } from '@/app/lib/api/updateBlogById';
// schema
import type { BlogEditFormValues } from '@/app/schema/blogSchema';

/** ブログ更新操作。 */
type UseUpdateBlogResult = {
    /** 記事を更新する。成功時は成功トーストを出して記事詳細へ遷移、失敗時はエラートーストを出す */
    updateBlog: (values: BlogEditFormValues) => void;
    /** 更新リクエスト送信中か。送信ボタンの多重押下防止に使う */
    isPending: boolean;
};

/**
 * ブログ記事の更新を扱う。通知（トースト）と更新後の遷移までをこのフックが担う。
 *
 * @param id - 更新対象のブログ ID
 * @returns 更新関数と送信中フラグ
 */
export function useUpdateBlog(id: string): UseUpdateBlogResult {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (values: BlogEditFormValues) => updateBlogById(id, values),
        onSuccess: () => {
            toast.success(COMMON_CONSTANTS.BLOG_UPDATE.TOAST_UPDATE_BLOG_SUCCESS);
            router.push(COMMON_CONSTANTS.LINK.BLOG_BY_ID.replace(':id', id));
        },
        onError: () => {
            toast.error(COMMON_CONSTANTS.BLOG_UPDATE.TOAST_UPDATE_BLOG_ERROR);
        },
    });

    return { updateBlog: mutation.mutate, isPending: mutation.isPending };
}
