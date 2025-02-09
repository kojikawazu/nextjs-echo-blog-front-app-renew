'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// constants
import { COMMON_CONSTANTS } from '../utils/const/constants';

// types
interface GlobalContextType {
    categories: string[];
    tags: string[];
    popularPosts: { id: string; title: string; likes: number }[];
    setGlobalData: (
        categories: string[],
        tags: string[],
        popularPosts: { id: string; title: string; likes: number }[],
    ) => void;
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
    const [popularPosts, setPopularPosts] = useState<
        { id: string; title: string; likes: number }[]
    >([]);

    useEffect(() => {
        const fetchGlobalData = async () => {
            // URLがroot以外の場合、データfetchする
            if (window.location.pathname !== '/') {
                try {
                    const [categoriesResponse, tagsResponse, popularPostsResponse] =
                        await Promise.all([
                            fetch(
                                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${COMMON_CONSTANTS.URL.BLOG_CATEGORIES}`,
                            ),
                            fetch(
                                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${COMMON_CONSTANTS.URL.BLOG_TAGS}`,
                            ),
                            fetch(
                                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${COMMON_CONSTANTS.URL.BLOG_POPULAR.replace(
                                    ':count',
                                    COMMON_CONSTANTS.GLOBAL_CONTEXT.BLOG_POPULAR_COUNT.toString(),
                                )}`,
                            ),
                        ]);

                    const categories = await categoriesResponse.json();
                    const tags = await tagsResponse.json();
                    const popularPosts = await popularPostsResponse.json();

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
    const setGlobalData = (
        categories: string[],
        tags: string[],
        popularPosts: { id: string; title: string; likes: number }[],
    ) => {
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
