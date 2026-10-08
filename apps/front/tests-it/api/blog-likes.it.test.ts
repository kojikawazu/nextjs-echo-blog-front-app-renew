import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as fetchLikes } from '@/app/api/blog-likes/route';
import { GET as generateVisitId } from '@/app/api/blog-likes/generate-visit-id/route';
import { POST as like, DELETE as unlike } from '@/app/api/blog-likes/[blogId]/route';
import { getReq, getReqWithCookie, routeParams, SEED } from '../helpers';

/**
 * IT: /api/blog-likes（BFF → 実 Go バックエンド → 実 PostgreSQL）。
 * 実バックエンドはいいね 0 件のとき nil スライスを JSON 化して `null` を返す。
 * BFF がこれを `[]` に正規化することを、発行 → 0 件 → いいね → 解除の流れで検証する（#17）。
 * seed のいいねと干渉しないよう、新規に発行した訪問者 ID と seed の 2 件目のブログを使う。
 */

/**
 * BFF 経由で訪問者 ID を発行し、後続リクエストに付ける Cookie（`name=value`）を返す。
 *
 * @returns `visit-id-token=...` 形式の Cookie 文字列
 */
const issueVisitorCookie = async (): Promise<string> => {
    const res = await generateVisitId(getReq());
    expect(res.status).toBe(200);
    const cookie = res.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .find((c) => c.startsWith('visit-id-token='));
    expect(cookie).toBeDefined();
    return cookie as string;
};

/**
 * Cookie 付きのボディなしリクエスト（POST / DELETE）を生成する。
 *
 * @param method - HTTP メソッド
 * @param cookie - 転送する Cookie
 * @returns 生成した `NextRequest`
 */
const reqWithCookie = (method: string, cookie: string): NextRequest =>
    new NextRequest('http://localhost/api', { method, headers: { cookie } });

describe('IT /api/blog-likes（実スタック）', () => {
    // --- 正常系 ---

    it('いいね → 一覧に含まれる → 解除 → 一覧が空配列（null ではない）', async () => {
        const cookie = await issueVisitorCookie();
        const blog = routeParams({ blogId: SEED.blogId2 });

        const liked = await like(reqWithCookie('POST', cookie), blog);
        expect(liked.status).toBe(200);

        const afterLike = await fetchLikes(getReqWithCookie(cookie));
        expect(afterLike.status).toBe(200);
        const afterLikeBody = (await afterLike.json()) as Array<{ blog_id: string }>;
        expect(afterLikeBody.map((l) => l.blog_id)).toEqual([SEED.blogId2]);

        const unliked = await unlike(reqWithCookie('DELETE', cookie), blog);
        expect(unliked.status).toBe(200);

        // #17: backend は 0 件で null を返すが、BFF は [] に正規化して返す
        const afterUnlike = await fetchLikes(getReqWithCookie(cookie));
        expect(afterUnlike.status).toBe(200);
        expect(await afterUnlike.json()).toEqual([]);
    });

    // --- 準正常系 ---

    it('発行直後（いいね 0 件）の一覧は空配列を返す', async () => {
        const cookie = await issueVisitorCookie();

        const res = await fetchLikes(getReqWithCookie(cookie));

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
    });

    it('同じブログへの二重いいねは 400 を返し、一覧は 1 件のまま', async () => {
        const cookie = await issueVisitorCookie();
        const blog = routeParams({ blogId: SEED.blogId2 });

        expect((await like(reqWithCookie('POST', cookie), blog)).status).toBe(200);
        // backend: "blog is already liked" → 400
        expect((await like(reqWithCookie('POST', cookie), blog)).status).toBe(400);

        const res = await fetchLikes(getReqWithCookie(cookie));
        expect(((await res.json()) as unknown[]).length).toBe(1);

        // 後片付け（blogs.likes を seed の値に戻す）
        await unlike(reqWithCookie('DELETE', cookie), blog);
    });

    // --- 異常系 ---

    it('訪問者 Cookie なしの一覧取得はエラー（500）をそのまま返し、[] に化けさせない', async () => {
        // backend: visit-id-token Cookie 無し → 500 "Failed to get visit id token"
        const res = await fetchLikes(getReq());

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Failed to get visit id token' });
    });

    it('不正な訪問者トークンの一覧取得もエラー（500）を返す', async () => {
        // backend: JWT 解析失敗 → 500 "Failed to get visit id"
        const res = await fetchLikes(getReqWithCookie('visit-id-token=garbage'));

        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Failed to get visit id' });
    });
});
