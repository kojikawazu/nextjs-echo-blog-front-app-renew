import React from 'react';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';

/**
 * 認証ページのレイアウト
 * @param children 子要素
 * @returns JSX.Element
 */
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    <main className="flex-1">{children}</main>
                </div>
            </div>
            <Footer />
        </div>
    );
}
