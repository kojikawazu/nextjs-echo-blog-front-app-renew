export const COMMON_CONSTANTS = {
    API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    URL: {
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        AUTH_CHECK: '/users/auth-check',

        BLOGS: '/blogs',
        BLOG_BY_ID: '/blogs/detail/:id',
        BLOG_CATEGORIES: '/blogs/categories',
        BLOG_TAGS: '/blogs/tags',
        BLOG_POPULAR: '/blogs/popular/:count',
        BLOG_CREATE: '/blogs/create',
        BLOG_UPDATE_BY_ID: '/blogs/update/:id',
        BLOG_DELETE_BY_ID: '/blogs/delete/:id',

        BLOG_LIKE_GENERATE_VISIT_ID: '/blog-likes/generate-visit-id',
        BLOG_LIKE_FETCH_LIKED_BLOGS: '/blog-likes',
        BLOG_LIKE_CREATE: '/blog-likes/create/:blogId',
        BLOG_LIKE_DELETE: '/blog-likes/delete/:blogId',
        BLOG_LIKE_IS_LIKED: '/blog-likes/is-liked/:blogId',

        COMMENTS_BLOG: '/comments/blog/:blogId',
        COMMENTS_CREATE: '/comments/create',
    },
    LINK: {
        HOME: '/',
        LOGIN: '/login',
        BLOG_BY_ID: '/blog/:id',
        EDIT: '/edit/:id',
        TAG: '/tag/:tag',
        CATEGORY: '/category/:category',
    },
    AUTH: {
        TOAST_LOGIN_SUCCESS: 'ログインしました',
        TOAST_LOGIN_ERROR: 'メールアドレスまたはパスワードが正しくありません',
        TOAST_LOGOUT_SUCCESS: 'ログアウトしました',
        TOAST_LOGOUT_ERROR: 'ログアウトに失敗しました',
    },
    SIDE_BAR: {
        CATEGORY_TITLE: 'カテゴリー',
        POPULAR_TITLE: '人気記事',
        TAG_TITLE: 'タグ',
    },
    BLOG_FETCH: {
        TOAST_FETCH_BLOG_ERROR: 'ブログの取得に失敗しました',
        TOAST_FETCH_BLOG_NOT_FOUND: 'ブログが見つかりません',
    },
    BLOG_LIST: {
        POPULAR: 'popular',
        NEWEST: 'newest',
    },
    BLOG_CREATE: {
        TOAST_CREATE_BLOG_SUCCESS: 'ブログを作成しました',
        TOAST_CREATE_BLOG_ERROR: 'ブログの作成に失敗しました',
    },
    BLOG_UPDATE: {
        TOAST_UPDATE_BLOG_SUCCESS: 'ブログを更新しました',
        TOAST_UPDATE_BLOG_ERROR: 'ブログの更新に失敗しました',
    },
    BLOG_DELETE: {
        TOAST_DELETE_BLOG_SUCCESS: 'ブログを削除しました',
        TOAST_DELETE_BLOG_ERROR: 'ブログの削除に失敗しました',
    },
    BLOG_LIKE: {
        TOAST_GENERATE_VISIT_ID_ERROR: '訪問者IDの生成に失敗しました',
        TOAST_LIKE_BLOG_SUCCESS: 'ブログをいいねしました',
        TOAST_LIKE_BLOG_ERROR: 'ブログのいいねに失敗しました',
        TOAST_UNLIKE_BLOG_SUCCESS: 'ブログのいいねを取り消しました',
        TOAST_UNLIKE_BLOG_ERROR: 'ブログのいいねの取り消しに失敗しました',
    },
    BLOG_COMMENTS: {
        TOAST_FETCH_COMMENTS_ERROR: 'コメントの取得に失敗しました',
        TOAST_CREATE_COMMENT_SUCCESS: 'コメントを作成しました',
        TOAST_CREATE_COMMENT_ERROR: 'コメントの作成に失敗しました',
    },
    GLOBAL_CONTEXT: {
        BLOG_POPULAR_COUNT: 5,
        FETCH_GLOBAL_DATA_ERROR: 'グローバルデータの取得に失敗しました',
    },
    GITHUB: {
        ERROR_MESSAGE: {
            API_ROUTER_ERROR: 'GitHub APIの取得に失敗しました',
        },
    },
};
