'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// api
import { fetchCategories } from '@/app/lib/api/fetchCategories';
import { fetchPopularBlogs } from '@/app/lib/api/fetchPopularBlogs';
import { fetchTags } from '@/app/lib/api/fetchTags';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import type { PopularBlog } from '@/app/types/blogs';

interface GlobalContextType {
    categories: string[];
    tags: string[];
    popularPosts: PopularBlog[];
    setGlobalData: (categories: string[], tags: string[], popularPosts: PopularBlog[]) => void;
}

// context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * グローバルデータのプロバイダー
 */
export function GlobalProvider({ children }: { children: React.ReactNode }) {
    // states
    // カテゴリー
    const [categories, setCategories] = useState<string[]>([]);
    // タグ
    const [tags, setTags] = useState<string[]>([]);
    // 人気記事
    const [popularPosts, setPopularPosts] = useState<PopularBlog[]>([]);

    useEffect(() => {
        const fetchGlobalData = async () => {
            // URLがroot以外の場合、データfetchする
            if (window.location.pathname !== '/') {
                try {
                    const [categories, tags, popularPosts] = await Promise.all([
                        fetchCategories(),
                        fetchTags(),
                        fetchPopularBlogs(COMMON_CONSTANTS.GLOBAL_CONTEXT.BLOG_POPULAR_COUNT),
                    ]);

                    setCategories(categories);
                    setTags(tags);
                    setPopularPosts(popularPosts);
                } catch (error) {
                    console.error(COMMON_CONSTANTS.GLOBAL_CONTEXT.FETCH_GLOBAL_DATA_ERROR, error);
                }
            }
        };

        fetchGlobalData();
    }, []);

    /**
     * グローバルデータを更新
     * @param categories カテゴリー
     * @param tags タグ
     * @param popularPosts 人気記事
     */
    const setGlobalData = (categories: string[], tags: string[], popularPosts: PopularBlog[]) => {
        setCategories(categories);
        setTags(tags);
        setPopularPosts(popularPosts);
    };

    return (
        <GlobalContext.Provider value={{ categories, tags, popularPosts, setGlobalData }}>
            {children}
        </GlobalContext.Provider>
    );
}

/**
 * `GlobalContext` を利用するカスタムフック
 */
export function useGlobalData() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalData must be used within a GlobalProvider');
    }
    return context;
}
