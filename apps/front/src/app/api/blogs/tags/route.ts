import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * タグ一覧を取得する（BFF プロキシ → `/blogs/tags`）。
 *
 * @param req - 受信リクエスト
 * @returns タグ一覧
 */
export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blogs/tags');
}
