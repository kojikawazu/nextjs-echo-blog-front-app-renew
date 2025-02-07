'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PulseLoader } from 'react-spinners';
// types
import { Blog } from '@/app/types/blogs';
// lib
import { fetchBlogs } from '@/app/lib/api/blogs';
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
const Home = ({ tag, category }: HomeProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(category ?? null);
    const [selectedTag, setSelectedTag] = useState<string | null>(tag ?? null);
    const [sortBy, setSortBy] = useState<string>('newest');

    // ブログデータを取得
    const { data, isLoading, isError } = useQuery({
        queryKey: ['blogs', { selectedTag, selectedCategory, sortBy, currentPage }],
        queryFn: () => fetchBlogs(currentPage, ITEMS_PER_PAGE, selectedTag as string, selectedCategory as string),
        enabled: currentPage > 0,
    });

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {tag ? `#${tag}の記事` : category ? `${category}の記事` : '最新の記事'}
            </h1>

            <BlogFilter
                allCategories={data?.allCategories ?? []}
                allTags={data?.allTags ?? []}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                sortBy={sortBy}
                setCategory={setSelectedCategory}
                setTag={setSelectedTag}
                setSortBy={setSortBy}
            />

            {isLoading ? (
                <div className="h-16 flex items-center justify-center">
                    <PulseLoader color="#ffffff" size={10} />
                </div>
            ) : isError ? (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-red-500 text-2xl">ブログの取得に失敗しました</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {data?.blogs?.length ? (
                            data.blogs.map((blog: Blog) => <BlogCard key={blog.id} blog={blog} />)
                        ) : (
                            <p className="text-gray-500 text-center">
                                ブログが見つかりませんでした
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
