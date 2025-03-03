import React from 'react';
import Link from 'next/link';

/**
 * フッター
 * @returns JSX.Element
 */
export function Footer() {
    return (
        <footer className="bg-white border-t border-green-100/50 mt-12">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">
                            サイト概要
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            TechBlogは、最新のテクノロジートレンドや開発者向けの情報を提供するプラットフォームです。
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">
                            リンク
                        </h3>
                        <ul className="space-y-3">
                            {/* <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    利用規約
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    プライバシーポリシー
                                </Link>
                            </li> */}
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    お問い合わせ
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">
                            フォロー
                        </h3>
                        <div className="flex space-x-6">
                            <a
                                href="#"
                                className="text-gray-600 hover:text-green-600 transition-colors"
                            >
                                Twitter
                            </a>
                            <a
                                href="#"
                                className="text-gray-600 hover:text-green-600 transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
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
