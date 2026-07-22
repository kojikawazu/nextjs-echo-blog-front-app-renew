import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * ブログ一覧を取得する（BFF プロキシ → `/blogs`）。
 *
 * @param req - 受信リクエスト
 * @returns ブログ一覧
 */
export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blogs');
}

/**
 * ブログを新規作成する（BFF プロキシ → `/blogs/create`。認証ユーザーのみ）。
 *
 * @param req - 記事内容を含む POST リクエスト
 * @returns バックエンドの作成応答
 */
export async function POST(req: NextRequest) {
    return proxyToBackend(req, '/blogs/create');
}
