import { describe, it, expect, afterEach } from 'vitest';
import { GET as getBlogs } from '@/app/api/blogs/route';
import { getReq } from '../helpers';

/**
 * IT: BFF プロキシの設定契約を実スタック上で検証する。
 * `BACKEND_API_URL` はサーバー専用（クライアント非露出）。未設定なら fail-closed で 500 を返す。
 */
describe('IT BFF プロキシ設定契約（実スタック）', () => {
    const original = process.env.BACKEND_API_URL;

    afterEach(() => {
        // 他の IT が依存するため必ず復元する
        process.env.BACKEND_API_URL = original;
    });

    // --- 異常系（設定不備は fail-closed） ---

    it('BACKEND_API_URL 未設定時は 500 を返す', async () => {
        delete process.env.BACKEND_API_URL;
        const res = await getBlogs(getReq());
        expect(res.status).toBe(500);

        const body = await res.json();
        expect(body.error).toBe('Backend API URL is not configured');
    });
});
