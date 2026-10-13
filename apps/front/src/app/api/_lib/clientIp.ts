import { isIP } from 'node:net';
import type { NextRequest } from 'next/server';

/**
 * リクエストのクライアント IP を返す。
 * `X-Forwarded-For` の右端（Cloud Run のフロントエンドが付与した接続元）を使う。
 * 左側は送信者が自由に書けるため使わない（偽装でバックエンドのレートリミットを回避できてしまう）。
 *
 * @param req - クライアントからの受信リクエスト
 * @returns クライアント IP。ヘッダがない・右端が IP として解釈できない場合は null
 */
export function getClientIp(req: NextRequest): string | null {
    const rightmost = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim();
    if (!rightmost || isIP(rightmost) === 0) {
        return null;
    }
    return rightmost;
}
