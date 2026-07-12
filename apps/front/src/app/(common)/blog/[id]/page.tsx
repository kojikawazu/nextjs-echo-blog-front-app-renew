import { BlogPost } from '@/app/components/blogs/BlogPost';

/**
 * ブログページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPost id={id} />;
}
