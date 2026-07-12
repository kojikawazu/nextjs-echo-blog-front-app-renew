'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PulseLoader } from 'react-spinners';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import { Blog } from '@/app/types/blogs';
// lib
import { fetchBlogs } from '@/app/lib/api/fetchBlogs';
// contexts
import { useGlobalData } from '@/app/contexts/GlobalContext';
// hooks
import { useDebounce } from '@/app/hooks/useDebounce';
import { useLikeBlog } from '@/app/hooks/useLikeBlog';
// components
import { BlogCard } from '@/app/components/blogs/parts/BlogCard';
import { BlogFilter } from '@/app/components/blogs/parts/BlogFilter';
import { Pagination } from '@/app/components/common/pages/Pagination';

const ITEMS_PER_PAGE = 10;

interface HomeProps {
    tag?: string;
    category?: string;
}

/**
 * ホームページ
 * @returns JSX.Element
 */
const Home = ({ tag = '', category = '' }: HomeProps) => {
    // contexts
    const { setGlobalData } = useGlobalData();
    // states
    // ページ
    const [currentPage, setCurrentPage] = useState(1);
    // カテゴリー
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        category ? decodeURIComponent(category) : null,
    );
    // タグ
    const [selectedTag, setSelectedTag] = useState<string | null>(
        tag ? decodeURIComponent(tag) : null,
    );
    // ソート方法
    const [sortBy, setSortBy] = useState<string>(COMMON_CONSTANTS.BLOG_LIST.NEWEST);
    // 検索クエリ
    const [searchQuery, setSearchQuery] = useState<string>('');
    // デバウンス
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    // いいねhooks
    const { hasLiked, likeBlog, unlikeBlog } = useLikeBlog();

    // ブログデータを取得
    const { data, isLoading, isError } = useQuery({
        queryKey: [
            'blogs',
            { selectedTag, selectedCategory, sortBy, currentPage, debouncedSearchQuery },
        ],
        queryFn: () =>
            fetchBlogs(
                currentPage,
                ITEMS_PER_PAGE,
                selectedTag as string,
                selectedCategory as string,
                sortBy as 'newest' | 'popular',
                debouncedSearchQuery as string,
            ),
        enabled: currentPage > 0,
    });

    useEffect(() => {
        if (data) {
            const popularPosts = [...data.blogs]
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 5)
                .map(({ id, title, likes }) => ({ id, title, likes }));

            setGlobalData(data.allCategories, data.allTags, popularPosts);
        }
    }, [data]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {selectedTag
                    ? `#${selectedTag}の記事`
                    : selectedCategory
                      ? `${selectedCategory}の記事`
                      : '最新の記事'}
            </h1>

            <BlogFilter
                allCategories={data?.allCategories ?? []}
                allTags={data?.allTags ?? []}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                sortBy={sortBy}
                searchQuery={searchQuery}
                setCategory={setSelectedCategory}
                setTag={setSelectedTag}
                setSortBy={setSortBy}
                setSearchQuery={setSearchQuery}
            />

            {isLoading ? (
                <div className="h-16 flex items-center justify-center h-screen">
                    <PulseLoader color="#dddddd" size={10} />
                </div>
            ) : isError ? (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-red-500 text-2xl">
                        {COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_ERROR}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {data?.blogs?.length ? (
                            data.blogs.map((blog: Blog) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                    hasLiked={hasLiked}
                                    likeBlog={likeBlog}
                                    unlikeBlog={unlikeBlog}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">
                                {COMMON_CONSTANTS.BLOG_FETCH.TOAST_FETCH_BLOG_NOT_FOUND}
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data?.totalPages ?? 1}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
