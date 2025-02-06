import { create } from 'zustand';
import type { Blog } from '@/app/types/blogs';

interface BlogState {
  blogs: Blog[];
  filteredBlogs: Blog[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  selectedTag: string | null;
  sortBy: 'newest' | 'popular';
  fetchBlogs: (page: number, limit: number) => void;
  createBlog: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'likes'>) => void;
  updateBlog: (id: string, blog: Partial<Blog>) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (blogId: string, visitId: string) => void;
  unlikeBlog: (blogId: string) => void;
  hasLiked: (blogId: string) => boolean;
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setTag: (tag: string | null) => void;
  setSortBy: (sort: 'newest' | 'popular') => void;
}

// サンプルデータ
const initialBlogs: Blog[] = [
  {
    id: '1',
    user_id: '1',
    title: '2024年のウェブ開発トレンド',
    github_url: 'https://github.com/example/web-trends-2024',
    category: 'Web Development',
    tags: ['JavaScript', 'React', 'Web Development'],
    description: '# 2024年のウェブ開発トレンド\n\n## はじめに\n最新のウェブ開発トレンドと、開発者が知っておくべき重要な技術について解説します。\n\n## 主要なトレンド\n1. AIと機械学習の統合\n2. WebAssemblyの普及\n3. Edge Computingの台頭\n\n## まとめ\n2024年は技術の革新が加速する年となりそうです。',
    likes: 42,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: '2',
    title: 'Reactの新機能とベストプラクティス',
    github_url: 'https://github.com/example/react-best-practices',
    category: 'React',
    tags: ['React', 'JavaScript', 'Frontend'],
    description: '# Reactの新機能とベストプラクティス\n\n## 概要\nReact 19の新機能と、モダンなReactアプリケーション開発におけるベストプラクティスを紹介します。\n\n## 主要な変更点\n- 新しいフック\n- パフォーマンスの改善\n- エラーハンドリング',
    likes: 35,
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    user_id: '1',
    title: 'TypeScriptで型安全なアプリケーション開発',
    github_url: 'https://github.com/example/typescript-safety',
    category: 'TypeScript',
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    description: '# TypeScriptで型安全なアプリケーション開発\n\n## はじめに\n型安全性を確保しながら、保守性の高いアプリケーションを開発する方法を解説します。\n\n## ポイント\n1. 厳格な型チェック\n2. ジェネリクスの活用\n3. 型推論の活用',
    likes: 28,
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    user_id: '2',
    title: 'Next.js 14の新機能総まとめ',
    github_url: 'https://github.com/example/nextjs-14-features',
    category: 'Next.js',
    tags: ['Next.js', 'React', 'Frontend'],
    description: '# Next.js 14の新機能総まとめ\n\n## 主要な新機能\n- Server Actionsの改善\n- Turbopackの安定版\n- 部分的プリレンダリング\n\n## パフォーマンスの改善\nNext.js 14では様々な面でパフォーマンスが向上しています。',
    likes: 31,
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z'
  },
  {
    id: '5',
    user_id: '1',
    title: 'マイクロフロントエンドアーキテクチャ入門',
    github_url: 'https://github.com/example/micro-frontend-intro',
    category: 'Architecture',
    tags: ['Architecture', 'Frontend', 'Microservices'],
    description: '# マイクロフロントエンドアーキテクチャ入門\n\n## 概要\nマイクロフロントエンドの基本概念と実装方法について解説します。\n\n## 実装方法\n1. Module Federationの活用\n2. Web Componentsの利用\n3. ルーティングの設計',
    likes: 25,
    created_at: '2024-01-11T11:45:00Z',
    updated_at: '2024-01-11T11:45:00Z'
  },
  {
    id: '6',
    user_id: '2',
    title: 'Rustで始める WebAssembly開発',
    github_url: 'https://github.com/example/rust-wasm-guide',
    category: 'WebAssembly',
    tags: ['Rust', 'WebAssembly', 'Programming'],
    description: '# Rustで始める WebAssembly開発\n\n## はじめに\nRustを使用してWebAssemblyアプリケーションを開発する方法を解説します。\n\n## 環境構築\n- Rustのインストール\n- wasm-packの設定\n- 開発環境の準備',
    likes: 22,
    created_at: '2024-01-10T16:30:00Z',
    updated_at: '2024-01-10T16:30:00Z'
  },
  {
    id: '7',
    user_id: '1',
    title: 'GraphQLスキーマ設計のベストプラクティス',
    github_url: 'https://github.com/example/graphql-schema-design',
    category: 'GraphQL',
    tags: ['GraphQL', 'API', 'Backend'],
    description: '# GraphQLスキーマ設計のベストプラクティス\n\n## スキーマ設計の原則\n1. 型の命名規則\n2. リレーションの設計\n3. ページネーションの実装\n\n## クエリの最適化\nN+1問題の解決方法とデータローダーの実装について解説します。',
    likes: 19,
    created_at: '2024-01-09T13:20:00Z',
    updated_at: '2024-01-09T13:20:00Z'
  },
  {
    id: '8',
    user_id: '2',
    title: 'Dockerコンテナのセキュリティ対策',
    github_url: 'https://github.com/example/docker-security',
    category: 'DevOps',
    tags: ['Docker', 'Security', 'DevOps'],
    description: '# Dockerコンテナのセキュリティ対策\n\n## 主要な対策\n1. イメージのスキャン\n2. 権限の最小化\n3. ネットワークセキュリティ\n\n## ベストプラクティス\nセキュアなDockerfile作成のガイドラインを紹介します。',
    likes: 27,
    created_at: '2024-01-08T10:10:00Z',
    updated_at: '2024-01-08T10:10:00Z'
  },
  {
    id: '9',
    user_id: '1',
    title: 'CSS Grid レイアウトマスターガイド',
    github_url: 'https://github.com/example/css-grid-guide',
    category: 'CSS',
    tags: ['CSS', 'Web Design', 'Frontend'],
    description: '# CSS Grid レイアウトマスターガイド\n\n## 基本概念\n- グリッドコンテナ\n- グリッドアイテム\n- グリッドライン\n\n## 実践的なレイアウト\n様々なレスポンシブレイアウトの実装例を紹介します。',
    likes: 33,
    created_at: '2024-01-07T09:00:00Z',
    updated_at: '2024-01-07T09:00:00Z'
  },
  {
    id: '10',
    user_id: '2',
    title: 'Kubernetes入門：基礎から実践まで',
    github_url: 'https://github.com/example/kubernetes-basics',
    category: 'DevOps',
    tags: ['Kubernetes', 'DevOps', 'Container'],
    description: '# Kubernetes入門：基礎から実践まで\n\n## 基本概念\n1. Podの理解\n2. Serviceの役割\n3. Deploymentの管理\n\n## クラスター管理\nクラスターの構築から運用までを詳しく解説します。',
    likes: 29,
    created_at: '2024-01-06T08:30:00Z',
    updated_at: '2024-01-06T08:30:00Z'
  },
  {
    id: '11',
    user_id: '1',
    title: 'Vue.js 3のComposition API完全ガイド',
    github_url: 'https://github.com/example/vue3-composition-api',
    category: 'Vue.js',
    tags: ['Vue.js', 'JavaScript', 'Frontend'],
    description: '# Vue.js 3のComposition API完全ガイド\n\n## 基本概念\n- setup関数\n- リアクティビティ\n- ライフサイクルフック\n\n## ユースケース\n実践的なコード例を交えて解説します。',
    likes: 24,
    created_at: '2024-01-05T12:45:00Z',
    updated_at: '2024-01-05T12:45:00Z'
  },
  {
    id: '12',
    user_id: '2',
    title: 'モノレポ管理ツール比較',
    github_url: 'https://github.com/example/monorepo-tools',
    category: 'Development',
    tags: ['Monorepo', 'Development', 'Tools'],
    description: '# モノレポ管理ツール比較\n\n## 主要なツール\n1. Nx\n2. Turborepo\n3. Lerna\n\n## 選定のポイント\n各ツールの特徴と使い分けについて解説します。',
    likes: 21,
    created_at: '2024-01-04T14:15:00Z',
    updated_at: '2024-01-04T14:15:00Z'
  }
];

// 以下のコードは変更なし
const LIKED_POSTS_KEY = 'techblog_liked_posts';

const getLikedPosts = (): string[] => {
  const liked = localStorage.getItem(LIKED_POSTS_KEY);
  return liked ? JSON.parse(liked) : [];
};

const saveLikedPosts = (posts: string[]) => {
  localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(posts));
};

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: initialBlogs,
  filteredBlogs: initialBlogs,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  searchQuery: '',
  selectedCategory: null,
  selectedTag: null,
  sortBy: 'newest',

  fetchBlogs: (page, limit) => {
    set({ loading: true });
    
    const state = get();
    let filtered = [...state.blogs];

    // 検索
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query) ||
        blog.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // カテゴリーフィルター
    if (state.selectedCategory) {
      filtered = filtered.filter(blog => 
        blog.category === state.selectedCategory
      );
    }

    // タグフィルター
    if (state.selectedTag) {
      filtered = filtered.filter(blog => 
        blog.tags.includes(state.selectedTag!)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      if (state.sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return b.likes - a.likes;
      }
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBlogs = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / limit);

    set({
      filteredBlogs: paginatedBlogs,
      totalPages,
      currentPage: page,
      loading: false
    });
  },

  createBlog: (blog) => {
    const newBlog: Blog = {
      ...blog,
      id: Math.random().toString(36).substr(2, 9),
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    set((state) => ({ 
      blogs: [...state.blogs, newBlog],
      filteredBlogs: [...state.filteredBlogs, newBlog]
    }));
  },

  updateBlog: (id, blog) => {
    set((state) => ({
      blogs: state.blogs.map((b) =>
        b.id === id
          ? { ...b, ...blog, updated_at: new Date().toISOString() }
          : b
      ),
      filteredBlogs: state.filteredBlogs.map((b) =>
        b.id === id
          ? { ...b, ...blog, updated_at: new Date().toISOString() }
          : b
      )
    }));
  },

  deleteBlog: (id) => {
    set((state) => ({
      blogs: state.blogs.filter((b) => b.id !== id),
      filteredBlogs: state.filteredBlogs.filter((b) => b.id !== id)
    }));
  },

  likeBlog: (blogId) => {
    const likedPosts = getLikedPosts();
    if (!likedPosts.includes(blogId)) {
      set((state) => ({
        blogs: state.blogs.map((b) =>
          b.id === blogId
            ? { ...b, likes: b.likes + 1 }
            : b
        ),
        filteredBlogs: state.filteredBlogs.map((b) =>
          b.id === blogId
            ? { ...b, likes: b.likes + 1 }
            : b
        )
      }));
      saveLikedPosts([...likedPosts, blogId]);
    }
  },

  unlikeBlog: (blogId) => {
    const likedPosts = getLikedPosts();
    if (likedPosts.includes(blogId)) {
      set((state) => ({
        blogs: state.blogs.map((b) =>
          b.id === blogId
            ? { ...b, likes: b.likes - 1 }
            : b
        ),
        filteredBlogs: state.filteredBlogs.map((b) =>
          b.id === blogId
            ? { ...b, likes: b.likes - 1 }
            : b
        )
      }));
      saveLikedPosts(likedPosts.filter(id => id !== blogId));
    }
  },

  hasLiked: (blogId) => {
    const likedPosts = getLikedPosts();
    return likedPosts.includes(blogId);
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchBlogs(1, 10); // 検索時は1ページ目に戻る
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchBlogs(1, 10);
  },

  setTag: (tag) => {
    set({ selectedTag: tag });
    get().fetchBlogs(1, 10);
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().fetchBlogs(get().currentPage, 10);
  }
}));