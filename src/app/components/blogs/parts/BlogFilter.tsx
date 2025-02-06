import React from 'react';
import { ArrowDownAZ, Flame } from 'lucide-react';
import { useBlogStore } from '@/app/stores/blogStores';

/**
 * ブログフィルター
 * @returns JSX.Element
 */
export function BlogFilter() {
  const { 
    searchQuery,
    selectedCategory,
    selectedTag,
    sortBy,
    setSearchQuery,
    setCategory,
    setTag,
    setSortBy,
    blogs 
  } = useBlogStore();

  const categories = Array.from(new Set(blogs.map(blog => blog.category)));
  const tags = Array.from(new Set(blogs.flatMap(blog => blog.tags)));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-sky-100">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="記事を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
        />

        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setCategory(e.target.value || null)}
            className="px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          >
            <option value="">すべてのカテゴリー</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedTag || ''}
            onChange={(e) => setTag(e.target.value || null)}
            className="px-4 py-2 bg-sky-50 border border-sky-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          >
            <option value="">すべてのタグ</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'newest'
                  ? 'bg-sky-500 text-white'
                  : 'bg-sky-50 text-gray-700 hover:bg-sky-100 hover:text-sky-600'
              }`}
            >
              <ArrowDownAZ className="h-4 w-4" />
              <span>新着順</span>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'popular'
                  ? 'bg-sky-500 text-white'
                  : 'bg-sky-50 text-gray-700 hover:bg-sky-100 hover:text-sky-600'
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>人気順</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}