'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// lib
import { fetchLikedBlogs } from '@/app/lib/api/blog-likes/fetchLikedBlogs';
import { likeBlogById } from '@/app/lib/api/blog-likes/likeBlogById';
import { unlikeBlogById } from '@/app/lib/api/blog-likes/unLikeBlogById';
import { generateVisitId } from '@/app/lib/api/blog-likes/generateVisitId';

const VISIT_ID_KEY = process.env.NEXT_PUBLIC_VISIT_ID_KEY as string;

/**
 * いいね機能のカスタムフック
 */
export function useLikeBlog() {
    const queryClient = useQueryClient();
    const [visitId, setVisitId] = useState<string | null>(null);

    // 訪問者IDを取得
    useEffect(() => {
        const fetchVisitId = async () => {
            try {
                await generateVisitId();
                setVisitId(VISIT_ID_KEY);
            } catch (error) {
                console.error('訪問者IDの生成に失敗しました:', error);
            }
        };
        fetchVisitId();
    }, []);

    // いいね済みの記事を取得
    const { data: likedPosts = [] } = useQuery({
        queryKey: ['likedBlogs'],
        queryFn: fetchLikedBlogs,
        enabled: true,
    });

    /**
     * いいね登録
     */
    const likeMutation = useMutation({
        mutationFn: (blogId: string) => likeBlogById(blogId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    /**
     * いいね取り消し
     */
    const unlikeMutation = useMutation({
        mutationFn: (blogId: string) => unlikeBlogById(blogId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });

    /**
     * ブログがいいねされているか判定
     */
    const hasLiked = (blogId: string) => likedPosts?.includes(blogId) ?? false;

    return {
        likeBlog: likeMutation.mutate,
        unlikeBlog: unlikeMutation.mutate,
        hasLiked,
    };
}
