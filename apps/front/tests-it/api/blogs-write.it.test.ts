import { describe, it, expect } from 'vitest';
import { POST as createBlog } from '@/app/api/blogs/route';
import { PUT as updateBlog, DELETE as deleteBlog } from '@/app/api/blogs/[id]/route';
import { bodyReq, routeParams, SEED } from '../helpers';

/**
 * IT: ブログ書き込み系の認証ガードを実スタックで検証する。
 * 認証 Cookie が無い場合、BFF が Cookie を転送しない → backend が 401 を返す、という
 * BFF ↔ backend の結合（Cookie パススルー）を確認する。
 */
describe('IT /api/blogs 書き込みの認証ガード（実スタック）', () => {
    // --- 準正常系（認証なしの作成/更新は拒否） ---

    it('認証 Cookie 無しの POST /api/blogs は 401 を返す', async () => {
        // backend CreateBlog: token Cookie 取得に失敗 → 401
        const res = await createBlog(
            bodyReq('POST', {
                title: 'x',
                githubUrl: 'https://github.com/a/b',
                category: 'Tech',
                description: 'd',
                tags: 't',
            }),
        );
        expect(res.status).toBe(401);
    });

    it('認証 Cookie 無しの PUT /api/blogs/:id は 401 を返す', async () => {
        const res = await updateBlog(
            bodyReq('PUT', { title: 'y' }),
            routeParams({ id: SEED.blogId }),
        );
        expect(res.status).toBe(401);
    });

    // --- 異常系（認証なしの削除は拒否） ---

    it('認証 Cookie 無しの DELETE /api/blogs/:id は 401 を返す', async () => {
        const res = await deleteBlog(bodyReq('DELETE'), routeParams({ id: SEED.blogId }));
        expect(res.status).toBe(401);
    });
});
