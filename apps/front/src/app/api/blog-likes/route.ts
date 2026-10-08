import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * いいね済みブログの一覧を取得する（BFF プロキシ → `/blog-likes`）。
 *
 * バックエンドはいいね 0 件のとき `null` を返す（Go の nil スライス）。フロントへの契約は
 * 「常に配列」とし、`null` は `[]` に正規化して返す（#17）。エラー応答・配列はそのまま返す。
 *
 * @param req - 訪問者 Cookie を含む受信リクエスト
 * @returns 訪問者がいいね済みのブログ一覧（0 件は空配列）
 */
export async function GET(req: NextRequest) {
    const res = await proxyToBackend(req, '/blog-likes');
    // エラー応答と本文なし（204）は正規化の対象外
    if (!res.ok || res.status === 204) {
        return res;
    }

    // 元のレスポンスを返せるよう、本文は clone 側で読む
    const body: unknown = await res.clone().json();
    if (body !== null) {
        return res;
    }

    const normalized = NextResponse.json([], { status: res.status });
    for (const cookie of res.headers.getSetCookie()) {
        normalized.headers.append('Set-Cookie', cookie);
    }
    return normalized;
}
