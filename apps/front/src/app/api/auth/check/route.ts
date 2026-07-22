import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

/**
 * 認証状態を確認する（BFF プロキシ → バックエンド `/users/auth-check`）。
 * 未認証（401/404）でもコンソールエラーを避けるため 200 + `null` を返す。
 *
 * @param req - Cookie を含む受信リクエスト
 * @returns 認証済みならユーザー情報、未認証なら 200 + `null`
 */
export async function GET(req: NextRequest) {
    const res = await proxyToBackend(req, '/users/auth-check');

    // 未認証（401/404）の場合は200+nullで返し、ブラウザのコンソールエラーを抑止
    if (!res.ok) {
        return NextResponse.json(null, { status: 200 });
    }

    return res;
}
