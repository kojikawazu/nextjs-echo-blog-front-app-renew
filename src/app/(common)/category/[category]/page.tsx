import Home from '@/app/components/home/Home';

/**
 * カテゴリページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    return <Home category={category} />;
}
