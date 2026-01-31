import Home from '@/app/components/home/Home';

/**
 * タグページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    return <Home tag={tag} />;
}
