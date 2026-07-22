import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * ログアウト（BFF プロキシ → バックエンド `/users/logout`）。認証 Cookie を転送する。
 *
 * @param req - 受信リクエスト
 * @returns バックエンドのログアウト応答
 */
export async function POST(req: NextRequest) {
    return proxyToBackend(req, '/users/logout');
}
