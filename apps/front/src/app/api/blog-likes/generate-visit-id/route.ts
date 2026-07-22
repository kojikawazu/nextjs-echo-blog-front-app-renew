import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * 訪問者 ID を生成する（BFF プロキシ → `/blog-likes/generate-visit-id`）。
 * いいねの重複防止に用いる訪問者 ID を Cookie として払い出す。
 *
 * @param req - 受信リクエスト
 * @returns 生成された訪問者 ID を含むバックエンド応答
 */
export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blog-likes/generate-visit-id');
}
