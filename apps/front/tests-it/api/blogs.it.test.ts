import { describe, it, expect } from 'vitest';
import { GET as getBlogs } from '@/app/api/blogs/route';
import { GET as getBlogById } from '@/app/api/blogs/[id]/route';
import { getReq, routeParams, SEED } from '../helpers';

/**
 * IT: /api/blogs（BFF Route Handler → 実 Go バックエンド → 実 PostgreSQL）。
 * seed.sql の決定的データに対して、プロキシ・ステータス・JSON 整形が実依存で機能するか検証する。
 */
describe('IT /api/blogs 読み取り（実スタック）', () => {
    // --- 正常系 ---

    it('GET /api/blogs は seed の記事一覧を返す', async () => {
        const res = await getBlogs(getReq());
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        const titles = (body as Array<{ title: string }>).map((b) => b.title);
        expect(titles).toContain('Test Blog Title');
        expect(titles).toContain('Second Blog Title');
    });

    it('GET /api/blogs/:id は指定 ID の記事詳細を返す', async () => {
        const res = await getBlogById(getReq(), routeParams({ id: SEED.blogId }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.id).toBe(SEED.blogId);
        expect(body.title).toBe('Test Blog Title');
        expect(body.category).toBe('Tech');
    });

    // --- 準正常系（想定内の不在） ---

    it('存在しない UUID の詳細取得は 404 を返す', async () => {
        // backend: repository がレコードを返せず "blog not found" → 404
        const res = await getBlogById(getReq(), routeParams({ id: SEED.missingUuid }));
        expect(res.status).toBe(404);
    });

    // --- 異常系（想定外の入力形式） ---

    it('UUID 形式でない ID は 404 を返す', async () => {
        // backend: uuid 列への不正値でクエリが失敗し "blog not found" に集約 → 404
        const res = await getBlogById(getReq(), routeParams({ id: SEED.malformedId }));
        expect(res.status).toBe(404);
    });
});
