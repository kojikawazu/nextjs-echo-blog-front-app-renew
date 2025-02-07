import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Echo Blog App',
    description: 'Echo Blog App',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
