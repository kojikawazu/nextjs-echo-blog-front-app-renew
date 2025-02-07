import type { Metadata } from 'next';
// provider
import { QueryProvider } from './provider/QueryProvider';
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
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
