import { Blog } from '@/app/types/blogs';

/**
 * ブログデータ(Mock)
 */
export const mockBlogs: Blog[] = [
    {
        id: '1',
        title: 'Test Blog 1',
        user_id: '1',
        github_url: 'https://github.com/test',
        category: 'Test Category',
        tags: ['Test Tag 1', 'Test Tag 2'],
        description: 'This is a test blog',
        likes: 10,
        comment_cnt: 5,
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
    },
    {
        id: '2',
        title: 'Test Blog 2',
        user_id: '2',
        github_url: 'https://github.com/test',
        category: 'Test Category',
        tags: ['Test Tag 1', 'Test Tag 2'],
        description: 'This is a test blog',
        likes: 8,
        comment_cnt: 4,
        created_at: '2021-01-02',
        updated_at: '2021-01-02',
    },
    {
        id: '3',
        title: 'Test Blog 3',
        user_id: '3',
        github_url: 'https://github.com/test',
        category: 'Test Category',
        tags: ['Test Tag 1', 'Test Tag 2'],
        description: 'This is a test blog',
        likes: 6,
        comment_cnt: 3,
        created_at: '2021-01-03',
        updated_at: '2021-01-03',
    },
    {
        id: '4',
        title: 'Test Blog 4',
        user_id: '4',
        github_url: 'https://github.com/test',
        category: 'Test Category',
        tags: ['Test Tag 1', 'Test Tag 2'],
        description: 'This is a test blog',
        likes: 4,
        comment_cnt: 2,
        created_at: '2021-01-04',
        updated_at: '2021-01-04',
    },
];

/**
 * ブログデータ(Mock)
 */
export const mockBlog: Blog = {
    id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
    title: 'Test Blog 1',
    user_id: '1',
    github_url: 'https://github.com/test',
    category: 'Test Category',
    tags: ['Test Tag 1', 'Test Tag 2'],
    description: 'This is a test blog',
    likes: 10,
    comment_cnt: 5,
    created_at: '2021-01-01',
    updated_at: '2021-01-01',
};

/**
 * カテゴリーデータ(Mock)
 */
export const mockCategories: string[] = ['Test Category 1', 'Test Category 2'];

/**
 * タグデータ(Mock)
 */
export const mockTags: string[] = ['Test Tag 1', 'Test Tag 2'];

/**
 * 人気記事データ(Mock)
 */
export const mockPopularPosts: { id: string; title: string; likes: number }[] = [
    { id: '1', title: 'Test Blog 1', likes: 10 },
    { id: '2', title: 'Test Blog 2', likes: 8 },
    { id: '3', title: 'Test Blog 3', likes: 6 },
];
