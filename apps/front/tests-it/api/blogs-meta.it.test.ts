import { describe, it, expect } from 'vitest';
import { GET as getCategories } from '@/app/api/blogs/categories/route';
import { GET as getTags } from '@/app/api/blogs/tags/route';
import { GET as getPopular } from '@/app/api/blogs/popular/[count]/route';
import { getReq, routeParams } from '../helpers';

/**
 * IT: /api/blogs のメタ系（categories / tags / popular）を実スタックで検証する。
 * seed のカテゴリ（Tech, Go）・タグ（go, testing, echo, api）に基づく。
 */
describe('IT /api/blogs メタ（実スタック）', () => {
    // --- 正常系 ---

    it('GET /api/blogs/categories は seed のカテゴリを含む', async () => {
        const res = await getCategories(getReq());
        expect(res.status).toBe(200);

        // 返却形状（string[] / オブジェクト配列）に依存せず、値の存在を検証する
        const body = await res.json();
        const serialized = JSON.stringify(body);
        expect(serialized).toContain('Tech');
        expect(serialized).toContain('Go');
    });

    it('GET /api/blogs/tags は seed のタグを含む', async () => {
        const res = await getTags(getReq());
        expect(res.status).toBe(200);

        const serialized = JSON.stringify(await res.json());
        expect(serialized).toContain('go');
        expect(serialized).toContain('echo');
    });

    it('GET /api/blogs/popular/:count は 200 で配列を返す', async () => {
        const res = await getPopular(getReq(), routeParams({ count: '5' }));
        expect(res.status).toBe(200);
        expect(Array.isArray(await res.json())).toBe(true);
    });

    // --- 準正常系（想定内の不正入力） ---

    it('popular の count が数値でない場合は 400 を返す', async () => {
        // backend: strconv.Atoi 失敗 → "Invalid count" → 400
        const res = await getPopular(getReq(), routeParams({ count: 'abc' }));
        expect(res.status).toBe(400);
    });
});
