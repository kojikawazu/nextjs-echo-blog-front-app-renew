import { describe, it, expect } from 'vitest';
import { GET as checkAuth } from '@/app/api/auth/check/route';
import { POST as login } from '@/app/api/auth/login/route';
import { getReq, getReqWithCookie, bodyReq } from '../helpers';

/**
 * IT: /api/auth（BFF → 実 Go バックエンド → 実 PostgreSQL）。
 * auth-check は BFF が backend の 401/404 を「200 + null」に正規化する点を実バックエンド相手に検証する。
 */
describe('IT /api/auth（実スタック）', () => {
    // --- 準正常系（未認証を BFF が 200 + null に正規化） ---

    it('Cookie 無しの auth-check は 200 + null を返す（BFF が backend 401 を正規化）', async () => {
        // backend: token Cookie 無し → 401 "Token not found"。BFF はコンソールエラー抑止のため 200+null に変換
        const res = await checkAuth(getReq());
        expect(res.status).toBe(200);
        expect(await res.json()).toBeNull();
    });

    it('不正トークンの auth-check は 200 + null を返す', async () => {
        // backend: JWT 解析失敗 → 401 "Invalid token" → BFF が 200+null に変換
        const res = await checkAuth(getReqWithCookie('token=garbage'));
        expect(res.status).toBe(200);
        expect(await res.json()).toBeNull();
    });

    // --- 準正常系（ログイン入力不備） ---

    it('空ボディのログインは 400 を返す', async () => {
        // backend AuthService.Login: email/password 未指定 → "email and password are required" → 400
        const res = await login(bodyReq('POST', {}));
        expect(res.status).toBe(400);
    });

    it('メール形式が不正なログインは 400 を返す', async () => {
        // backend: "invalid email format" → 400
        const res = await login(bodyReq('POST', { email: 'not-an-email', password: 'whatever' }));
        expect(res.status).toBe(400);
    });

    // --- 異常系（誤った認証情報） ---

    it('存在しないユーザーのログインは 401 を返す', async () => {
        // backend: 形式は妥当だがユーザー取得に失敗 → 401 "Invalid credentials"
        const res = await login(
            bodyReq('POST', { email: 'nobody@example.com', password: 'wrongpass' }),
        );
        expect(res.status).toBe(401);
    });
});
