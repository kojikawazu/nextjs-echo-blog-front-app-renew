import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * カテゴリ一覧を取得する（BFF プロキシ → `/blogs/categories`）。
 *
 * @param req - 受信リクエスト
 * @returns カテゴリ一覧
 */
export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blogs/categories');
}
