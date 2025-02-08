export const COMMON_CONSTANTS = {
    API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    URL: {
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        AUTH_CHECK: '/users/auth-check',

        BLOGS: '/blogs',
        BLOG_BY_ID: '/blogs/detail/:id',
        BLOG_UPDATE_BY_ID: '/blogs/update/:id',
        BLOG_DELETE_BY_ID: '/blogs/delete/:id',
    },
};
