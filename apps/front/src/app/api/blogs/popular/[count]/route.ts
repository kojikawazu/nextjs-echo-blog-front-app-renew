import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * 人気ブログを取得する（BFF プロキシ → `/blogs/popular/:count`）。
 * パスパラメータ `count` で件数（例: TOP5）を指定する。
 *
 * @param req - 受信リクエスト
 * @returns いいね数上位のブログ一覧
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ count: string }> }) {
    const { count } = await params;
    return proxyToBackend(req, `/blogs/popular/${count}`);
}
