import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchAuthUser } from '@/app/lib/api/auth/fetchAuthUser';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * 唯一の外部 I/O である global.fetch のみモックし、User への変換・未認証の正規化は実物を検証する。
 */
const mockFetch = (json: () => Promise<unknown>, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({ ok, json }) as unknown as typeof fetch;
};

describe('fetchAuthUser', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('認証済みならバックエンドのレスポンスを User に変換して返す', async () => {
        mockFetch(async () => ({ user_id: 'u1', username: 'koji', email: 'a@example.com' }));

        await expect(fetchAuthUser()).resolves.toEqual({
            id: 'u1',
            name: 'koji',
            email: 'a@example.com',
            created_at: '',
            updated_at: '',
        });
        expect(global.fetch).toHaveBeenCalledWith(COMMON_CONSTANTS.URL.AUTH_CHECK, {
            method: 'GET',
            credentials: 'include',
        });
    });

    // --- 準正常系 ---

    it('BFF が未認証で 200 + null を返した場合は null を返す', async () => {
        mockFetch(async () => null);

        await expect(fetchAuthUser()).resolves.toBeNull();
    });

    it('エラーステータスの場合は本文を読まずに null を返す', async () => {
        const json = vi.fn();
        mockFetch(json, false);

        await expect(fetchAuthUser()).resolves.toBeNull();
        expect(json).not.toHaveBeenCalled();
    });

    // --- 異常系 ---

    it('ネットワーク障害は例外をそのまま伝播する', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;

        await expect(fetchAuthUser()).rejects.toThrow('Failed to fetch');
    });

    it('JSON パースに失敗した場合は例外を伝播する', async () => {
        mockFetch(async () => {
            throw new SyntaxError('Unexpected token');
        });

        await expect(fetchAuthUser()).rejects.toThrow(SyntaxError);
    });
});
