import EditPost from '@/app/components/blogs/EditPost';

/**
 * 記事編集ページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditPost id={id} />;
}
