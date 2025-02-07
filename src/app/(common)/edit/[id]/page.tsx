import EditPost from '@/app/components/blogs/EditPost';

/**
 * 記事編集ページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default function EditPostPage({ params }: { params: { id: string } }) {
    return <EditPost />;
}
