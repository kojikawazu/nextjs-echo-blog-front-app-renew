import { describe, it, expect, vi, afterEach } from 'vitest';
import { login } from '@/app/lib/api/auth/login';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、リクエスト組み立て・エラー判定は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('login', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('メール・パスワードを JSON で POST し、Cookie を含めて送る', async () => {
        mockFetch(async () => ({ message: 'ok' }));

        await expect(login('a@example.com', 'secret')).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(COMMON_CONSTANTS.URL.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'a@example.com', password: 'secret' }),
            credentials: 'include',
        });
    });

    // --- 準正常系 ---

    it('認証失敗（エラーステータス）の場合はログイン失敗メッセージで例外を投げる', async () => {
        mockFetch(async () => ({}), false);

        await expect(login('a@example.com', 'wrong')).rejects.toThrow(
            COMMON_CONSTANTS.AUTH.TOAST_LOGIN_ERROR,
        );
    });

    // --- 異常系 ---

    it('ネットワーク障害は例外をそのまま伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

        await expect(login('a@example.com', 'secret')).rejects.toThrow('Failed to fetch');
    });
});
