'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// lib
import { deleteBlogById } from '@/app/lib/api/deleteBlogById';

/** ブログ削除操作。 */
type UseDeleteBlogResult = {
    /** 記事を削除する。成功時は成功トーストを出してホームへ遷移、失敗時はエラートーストを出す */
    deleteBlog: () => void;
    /** 削除リクエスト送信中か */
    isPending: boolean;
};

/**
 * ブログ記事の削除を扱う。通知（トースト）と削除後の遷移までをこのフックが担う。
 *
 * @param id - 削除対象のブログ ID
 * @returns 削除関数と送信中フラグ
 */
export function useDeleteBlog(id: string): UseDeleteBlogResult {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: () => deleteBlogById(id),
        onSuccess: () => {
            toast.success(COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_SUCCESS);
            router.push(COMMON_CONSTANTS.LINK.HOME);
        },
        onError: () => {
            toast.error(COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_ERROR);
        },
    });

    return { deleteBlog: () => mutation.mutate(), isPending: mutation.isPending };
}
