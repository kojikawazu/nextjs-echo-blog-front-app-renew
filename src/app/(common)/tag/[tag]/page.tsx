import Home from '@/app/components/home/Home';

/**
 * タグページ
 * @param params パラメータ
 * @returns JSX.Element
 */
export default function TagPage({ params }: { params: { tag: string } }) {
    return <Home tag={params.tag} />;
}
