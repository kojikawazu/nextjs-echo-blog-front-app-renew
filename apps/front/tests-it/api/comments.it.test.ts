import { describe, it, expect } from 'vitest';
import { GET as getComments } from '@/app/api/comments/[blogId]/route';
import { POST as createComment } from '@/app/api/comments/route';
import { getReq, bodyReq, routeParams, SEED } from '../helpers';

/**
 * IT: /api/comments（BFF → 実 Go バックエンド → 実 PostgreSQL）。
 * seed には fixture ブログに 1 件のコメント（'Nice post!' / 'Guest User'）が存在する。
 */
describe('IT /api/comments（実スタック）', () => {
    // --- 正常系 ---

    it('GET /api/comments/:blogId は seed のコメントを返す', async () => {
        const res = await getComments(getReq(), routeParams({ blogId: SEED.blogId }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        const comments = body as Array<{ comment: string; guest_user: string }>;
        expect(comments.map((c) => c.comment)).toContain('Nice post!');
        expect(comments.map((c) => c.guest_user)).toContain('Guest User');
    });

    // --- 準正常系（想定内の不正入力） ---

    it('空ボディの POST /api/comments は 400 を返す', async () => {
        // backend CreateComment: blogId 未指定 → "invalid blogId" → 400
        const res = await createComment(bodyReq('POST', {}));
        expect(res.status).toBe(400);
    });
});
