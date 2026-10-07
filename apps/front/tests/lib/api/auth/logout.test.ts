import { describe, it, expect, vi, afterEach } from 'vitest';
import { logout } from '@/app/lib/api/auth/logout';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、エラー判定は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('logout', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('Cookie を含めて POST する', async () => {
        mockFetch(async () => ({ message: 'ok' }));

        await expect(logout()).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledWith(COMMON_CONSTANTS.URL.LOGOUT, {
            method: 'POST',
            credentials: 'include',
        });
    });

    // --- 準正常系 ---

    it('エラーステータスの場合はログアウト失敗メッセージで例外を投げる', async () => {
        mockFetch(async () => ({}), false);

        await expect(logout()).rejects.toThrow(COMMON_CONSTANTS.AUTH.TOAST_LOGOUT_ERROR);
    });

    // --- 異常系 ---

    it('ネットワーク障害は例外をそのまま伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

        await expect(logout()).rejects.toThrow('Failed to fetch');
    });
});
