'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BlogCard } from '@/app/components/blogs/parts/BlogCard';
import { BlogFilter } from '@/app/components/blogs/parts/BlogFilter';
import { Pagination } from '@/app/components/common/pages/Pagination';
import { useBlogStore } from '@/app/stores/blogStores';

const ITEMS_PER_PAGE = 10;

/**
 * ホームページ
 * @returns JSX.Element
 */
export default function Home() {
  const { tag, category } = useParams();
  const { 
    filteredBlogs,
    currentPage,
    totalPages,
    fetchBlogs,
    setTag,
    setCategory
  } = useBlogStore();

  useEffect(() => {
    if (tag) {
      setTag(tag as string);
    } else if (category) {
      setCategory(category as string);
    }
  }, [tag, category]);

  useEffect(() => {
    fetchBlogs(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {tag ? `#${tag}の記事` : category ? `${category}の記事` : '最新の記事'}
      </h1>
      
      <BlogFilter />

      <div className="space-y-6">
        {filteredBlogs.map(blog => (
          <BlogCard
            key={blog.id}
            blog={blog}
          />
        ))}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchBlogs(page, ITEMS_PER_PAGE)}
        />
      </div>
    </div>
  );
}
