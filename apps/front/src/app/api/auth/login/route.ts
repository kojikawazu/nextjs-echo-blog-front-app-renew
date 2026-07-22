import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * ログイン（BFF プロキシ → バックエンド `/users/login`）。認証 Cookie を転送する。
 *
 * @param req - メール／パスワードを含む POST リクエスト
 * @returns バックエンドのログイン応答
 */
export async function POST(req: NextRequest) {
    return proxyToBackend(req, '/users/login');
}
