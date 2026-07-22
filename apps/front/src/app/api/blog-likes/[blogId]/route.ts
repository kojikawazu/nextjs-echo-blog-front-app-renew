import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * いいねを登録する（BFF プロキシ → `/blog-likes/create/:blogId`）。
 * パスパラメータ `blogId` を転送先に埋め込む。
 *
 * @param req - 訪問者情報を含む POST リクエスト
 * @returns バックエンドのいいね登録応答
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ blogId: string }> }) {
    const { blogId } = await params;
    return proxyToBackend(req, `/blog-likes/create/${blogId}`);
}

/**
 * いいねを取り消す（BFF プロキシ → `/blog-likes/delete/:blogId`）。
 * パスパラメータ `blogId` を転送先に埋め込む。
 *
 * @param req - 訪問者情報を含む DELETE リクエスト
 * @returns バックエンドのいいね取消応答
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ blogId: string }> },
) {
    const { blogId } = await params;
    return proxyToBackend(req, `/blog-likes/delete/${blogId}`);
}
