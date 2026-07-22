import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * 指定ブログのコメント一覧を取得する（BFF プロキシ → `/comments/blog/:blogId`）。
 *
 * @param req - 受信リクエスト
 * @returns 指定ブログに紐づくコメント一覧
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;
    return proxyToBackend(req, `/comments/blog/${blogId}`);
}
