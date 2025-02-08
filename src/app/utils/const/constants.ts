export const COMMON_CONSTANTS = {
    API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    URL: {
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        AUTH_CHECK: '/users/auth-check',

        BLOGS: '/blogs',
        BLOG_BY_ID: '/blogs/detail/:id',
        BLOG_CREATE: '/blogs/create',
        BLOG_UPDATE_BY_ID: '/blogs/update/:id',
        BLOG_DELETE_BY_ID: '/blogs/delete/:id',

        BLOG_LIKE_GENERATE_VISIT_ID: '/blog-likes/generate-visit-id',
        BLOG_LIKE_FETCH_LIKED_BLOGS: '/blog-likes',
        BLOG_LIKE_CREATE: '/blog-likes/create/:blogId',
        BLOG_LIKE_DELETE: '/blog-likes/delete/:blogId',
        BLOG_LIKE_IS_LIKED: '/blog-likes/is-liked/:blogId',
    },
};
