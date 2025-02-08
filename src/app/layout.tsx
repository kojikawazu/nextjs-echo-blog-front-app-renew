import type { Metadata } from 'next';
// provider
import { QueryProvider } from './provider/QueryProvider';
// context
import { AuthProvider } from './contexts/AuthContext';
// css
import './globals.css';

export const metadata: Metadata = {
    title: 'Echo Blog App',
    description: 'Echo Blog App',
};

/**
 * RootLayout
 * @param children
 * @returns
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>
                <QueryProvider>
                    <AuthProvider>{children}</AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
