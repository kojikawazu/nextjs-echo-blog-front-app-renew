import { create } from 'zustand';
import type { Comment } from '@/app/types/blogs';

interface CommentState {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  fetchComments: (blogId: string, page: number, limit: number) => void;
  addComment: (comment: Omit<Comment, 'id' | 'created_at'>) => void;
}

// サンプルデータ
const initialComments: Comment[] = [
  {
    id: '1',
    blog_id: '1',
    guest_user: 'WebDev123',
    comment: '素晴らしい記事ですね！とても参考になりました。',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    blog_id: '1',
    guest_user: 'TechFan',
    comment: '最新のトレンドがよくわかりました。',
    parent_id: '1',
    created_at: new Date().toISOString()
  }
];

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: initialComments,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  fetchComments: (blogId, page, limit) => {
    set({ loading: true });
    const allComments = get().comments.filter(c => c.blog_id === blogId);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedComments = allComments.slice(start, end);
    const totalPages = Math.ceil(allComments.length / limit);

    set({
      comments: paginatedComments,
      totalPages,
      currentPage: page,
      loading: false
    });
  },
  addComment: (comment) => {
    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    set((state) => ({
      comments: [...state.comments, newComment]
    }));
  }
}));