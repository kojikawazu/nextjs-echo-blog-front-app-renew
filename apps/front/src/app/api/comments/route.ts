import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * コメントを投稿する（BFF プロキシ → `/comments/create`。ゲスト投稿可）。
 *
 * @param req - ゲスト名とコメント本文を含む POST リクエスト
 * @returns バックエンドのコメント作成応答
 */
export async function POST(req: NextRequest) {
    return proxyToBackend(req, '/comments/create');
}
