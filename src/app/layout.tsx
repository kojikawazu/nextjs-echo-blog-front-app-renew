import type { Metadata } from 'next';
// provider
import { QueryProvider } from '@/app/provider/QueryProvider';
import { ToastProvider } from '@/app/provider/ToastProvider';
// context
import { AuthProvider } from '@/app/contexts/AuthContext';
import { GlobalProvider } from '@/app/contexts/GlobalContext';
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
                    <AuthProvider>
                        <GlobalProvider>
                            <ToastProvider />
                            {children}
                        </GlobalProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
