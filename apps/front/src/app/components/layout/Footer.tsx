/**
 * フッター
 * @returns JSX.Element
 */
export function Footer() {
    return (
        <footer className="bg-white border-t border-green-100/50 mt-12">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">
                        サイト概要
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        TechBlogは、最新のテクノロジートレンドや開発者向けの情報を提供するプラットフォームです。
                    </p>
                </div>
                <div className="mt-12 border-t border-green-100/50 pt-8">
                    <p className="text-center text-gray-600">
                        © {new Date().getFullYear()} TechBlog. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
