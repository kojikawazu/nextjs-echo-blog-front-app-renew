import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * ブログ詳細を取得する（BFF プロキシ → `/blogs/detail/:id`）。
 *
 * @param req - 受信リクエスト
 * @returns 指定 ID のブログ詳細
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `/blogs/detail/${id}`);
}

/**
 * ブログを更新する（BFF プロキシ → `/blogs/update/:id`。オーナーのみ）。
 *
 * @param req - 更新内容を含む PUT リクエスト
 * @returns バックエンドの更新応答
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `/blogs/update/${id}`);
}

/**
 * ブログを削除する（BFF プロキシ → `/blogs/delete/:id`。オーナーのみ）。
 *
 * @param req - DELETE リクエスト
 * @returns バックエンドの削除応答
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `/blogs/delete/${id}`);
}
