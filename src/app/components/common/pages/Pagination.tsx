import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * ページネーション
 * @param currentPage 現在のページ
 * @param totalPages 総ページ数
 * @param onPageChange ページ変更イベント
 * @returns JSX.Element
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 rounded-full hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-sky-600 transition-colors border border-sky-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-12 h-12 rounded-full font-medium transition-colors ${
            currentPage === page
              ? 'bg-sky-500 text-white'
              : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600 border border-sky-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 rounded-full hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:text-sky-600 transition-colors border border-sky-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}