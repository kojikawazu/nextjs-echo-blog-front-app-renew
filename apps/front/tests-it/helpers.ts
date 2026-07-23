import { NextRequest } from 'next/server';

/**
 * IT 共通ヘルパー。BFF Route Handler を in-process で叩くための最小限のリクエスト生成と、
 * バックエンドの seed.sql と一致する固定フィクスチャを提供する。
 */

/**
 * GET リクエストを生成する。
 *
 * @param url - リクエスト URL（BFF 側では未使用だが Request 生成に必要）
 * @returns 生成した `NextRequest`
 */
export const getReq = (url = 'http://localhost/api'): NextRequest =>
    new NextRequest(url, { method: 'GET' });

/**
 * Cookie ヘッダー付きの GET リクエストを生成する（BFF の Cookie 転送検証用）。
 *
 * @param cookie - 転送する Cookie 文字列（例: `token=xxx`）
 * @param url - リクエスト URL
 * @returns 生成した `NextRequest`
 */
export const getReqWithCookie = (cookie: string, url = 'http://localhost/api'): NextRequest =>
    new NextRequest(url, { method: 'GET', headers: { cookie } });

/**
 * ボディ付き（または無し）のリクエストを生成する。
 *
 * @param method - HTTP メソッド（POST / PUT / DELETE 等）
 * @param body - 送信する JSON ボディ。未指定ならボディ無し
 * @param url - リクエスト URL
 * @returns 生成した `NextRequest`
 */
export const bodyReq = (
    method: string,
    body?: unknown,
    url = 'http://localhost/api',
): NextRequest =>
    new NextRequest(url, {
        method,
        headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

/**
 * 動的ルートの `params`（Next.js 16 では Promise）を組み立てる。
 *
 * @param p - パスパラメータのオブジェクト
 * @returns Route Handler 第 2 引数の形（`{ params: Promise<...> }`）
 */
export const routeParams = <T extends Record<string, string>>(p: T): { params: Promise<T> } => ({
    params: Promise.resolve(p),
});

/**
 * backend の `testsupport/testdata/seed.sql` と一致する固定フィクスチャ。
 * これらが変わった場合は seed.sql 側と合わせて更新する。
 */
export const SEED = {
    /** コメント・いいねを持つブログ（seed の 1 件目）。 */
    blogId: '22222222-2222-2222-2222-222222222222',
    /** コメントを持たないブログ（seed の 2 件目）。 */
    blogId2: '22222222-2222-2222-2222-222222222223',
    /** DB に存在しない UUID（not-found 検証用）。 */
    missingUuid: '99999999-9999-9999-9999-999999999999',
    /** UUID 形式でない ID（型不一致検証用）。 */
    malformedId: 'not-a-uuid',
} as const;
