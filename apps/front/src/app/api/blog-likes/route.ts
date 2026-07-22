import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * いいね済みブログの一覧を取得する（BFF プロキシ → `/blog-likes`）。
 *
 * @param req - 訪問者 Cookie を含む受信リクエスト
 * @returns 訪問者がいいね済みのブログ一覧
 */
export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blog-likes');
}
