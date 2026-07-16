'use client';

import { Toaster } from 'react-hot-toast';

/**
 * `react-hot-toast` のプロバイダー
 */
export function ToastProvider() {
    return <Toaster position="top-right" reverseOrder={false} />;
}
