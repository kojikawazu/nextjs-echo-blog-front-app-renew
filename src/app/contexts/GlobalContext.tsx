'use client';

import React, { createContext, useContext, useState } from 'react';

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
