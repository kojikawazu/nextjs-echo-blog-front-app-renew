import { BlogPost } from '@/app/components/blogs/BlogPost';

/**
 * ブログページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default function BlogPage({ params }: { params: { id: string } }) {
    return (
        <BlogPost id={params.id} />
    );
}