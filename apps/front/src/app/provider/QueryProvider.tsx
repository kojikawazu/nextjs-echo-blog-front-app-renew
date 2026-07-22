'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

/**
 * TanStack Query の QueryClient をツリーに供給する Provider。
 *
 * @param children - Provider 配下にレンダリングする子要素
 */
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
