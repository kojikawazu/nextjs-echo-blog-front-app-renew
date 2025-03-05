import type { Comment } from '@/app/types/blogs';

export const mockComments: Comment[] = [
    {
        id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1235',
        comment: 'Test Comment 1',
        created_at: '2021-01-01',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '2',
        comment: 'Test Comment 2',
        created_at: '2021-01-02',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '3',
        comment: 'Test Comment 3',
        created_at: '2021-01-03',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '4',
        comment: 'Test Comment 4',
        created_at: '2021-01-04',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
];

export const mockCommentsAfterAdd: Comment[] = [
    {
        id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1235',
        comment: 'Test Comment 1',
        created_at: '2021-01-01',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '2',
        comment: 'Test Comment 2',
        created_at: '2021-01-02',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '3',
        comment: 'Test Comment 3',
        created_at: '2021-01-03',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '4',
        comment: 'Test Comment 4',
        created_at: '2021-01-04',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
    {
        id: '5',
        comment: 'Test Comment 5',
        created_at: '2021-01-05',
        blog_id: '2a3f4d9c-6c7b-4e2f-a2f8-9b10b4cd1234',
        guest_user: 'Test User',
    },
];
