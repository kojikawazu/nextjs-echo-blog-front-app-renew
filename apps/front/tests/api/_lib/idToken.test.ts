// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * バックエンド呼び出し用の ID トークン取得。外部 I/O はメタデータサーバーへの global.fetch のみで、fetch のみモックする。
 * モジュール内にキャッシュを持つため、テストごとにモジュールを読み直して状態を分離する。
 */
const AUDIENCE = 'https://backend.test';
const NOW_MS = Date.UTC(2026, 9, 13, 0, 0, 0);

/** `exp`（秒）を持つ署名なしの JWT を組み立てる */
const jwt = (payload: object) =>
    `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

/** メタデータサーバーの応答を模す */
const metadataResponse = (status: number, text: string) => ({
    status,
    ok: status >= 200 && status < 300,
    text: async () => text,
});

const loadModule = async () => {
    vi.resetModules();
    return import('@/app/api/_lib/idToken');
};

describe('getBackendIdToken', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW_MS);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('メタデータサーバーから audience を指定して取得する', async () => {
        const token = jwt({ exp: NOW_MS / 1000 + 3600 });
        global.fetch = vi
            .fn()
            .mockResolvedValue(metadataResponse(200, token)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await expect(getBackendIdToken(AUDIENCE)).resolves.toBe(token);
        expect(global.fetch).toHaveBeenCalledWith(
            'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=https%3A%2F%2Fbackend.test',
            expect.objectContaining({ headers: { 'Metadata-Flavor': 'Google' } }),
        );
    });

    it('有効期限の 5 分前まではキャッシュを返し、メタデータサーバーを呼ばない', async () => {
        const token = jwt({ exp: NOW_MS / 1000 + 3600 });
        global.fetch = vi
            .fn()
            .mockResolvedValue(metadataResponse(200, token)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await getBackendIdToken(AUDIENCE);
        vi.setSystemTime(NOW_MS + 54 * 60 * 1000);
        await expect(getBackendIdToken(AUDIENCE)).resolves.toBe(token);

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // --- 準正常系 ---

    it('有効期限の 5 分前を過ぎたら取り直す', async () => {
        const first = jwt({ exp: NOW_MS / 1000 + 3600 });
        const second = jwt({ exp: NOW_MS / 1000 + 7200 });
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce(metadataResponse(200, first))
            .mockResolvedValueOnce(metadataResponse(200, second)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await getBackendIdToken(AUDIENCE);
        vi.setSystemTime(NOW_MS + 55 * 60 * 1000);
        await expect(getBackendIdToken(AUDIENCE)).resolves.toBe(second);

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('同時の呼び出しは 1 回の取得にまとめる', async () => {
        const token = jwt({ exp: NOW_MS / 1000 + 3600 });
        global.fetch = vi
            .fn()
            .mockResolvedValue(metadataResponse(200, token)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        const results = await Promise.all([
            getBackendIdToken(AUDIENCE),
            getBackendIdToken(AUDIENCE),
            getBackendIdToken(AUDIENCE),
        ]);

        expect(results).toEqual([token, token, token]);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('audience が異なる場合はキャッシュを使わない', async () => {
        const token = jwt({ exp: NOW_MS / 1000 + 3600 });
        global.fetch = vi
            .fn()
            .mockResolvedValue(metadataResponse(200, token)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await getBackendIdToken(AUDIENCE);
        await getBackendIdToken('https://other.test');

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // --- 異常系 ---

    it('メタデータサーバーが 2xx 以外を返したら例外を投げ、次回は取り直す', async () => {
        const token = jwt({ exp: NOW_MS / 1000 + 3600 });
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce(metadataResponse(500, 'error'))
            .mockResolvedValueOnce(metadataResponse(200, token)) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await expect(getBackendIdToken(AUDIENCE)).rejects.toThrow(
            'Failed to fetch ID token from metadata server: status 500',
        );
        await expect(getBackendIdToken(AUDIENCE)).resolves.toBe(token);
    });

    it('メタデータサーバーに接続できない場合は例外を投げる', async () => {
        global.fetch = vi
            .fn()
            .mockRejectedValue(new TypeError('fetch failed')) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await expect(getBackendIdToken(AUDIENCE)).rejects.toThrow('fetch failed');
    });

    it('JWT の形式でない応答は例外を投げ、キャッシュしない', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(metadataResponse(200, 'not-a-jwt')) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await expect(getBackendIdToken(AUDIENCE)).rejects.toThrow('Invalid ID token format');
        await expect(getBackendIdToken(AUDIENCE)).rejects.toThrow('Invalid ID token format');
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('ペイロードに exp がない応答は例外を投げる', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                metadataResponse(200, jwt({ aud: AUDIENCE })),
            ) as unknown as typeof fetch;
        const { getBackendIdToken } = await loadModule();

        await expect(getBackendIdToken(AUDIENCE)).rejects.toThrow();
    });
});

describe('isRunningOnCloudRun', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    // --- 正常系 ---

    it('K_SERVICE があれば true', async () => {
        vi.stubEnv('K_SERVICE', 'nextjs-echo-blog-app-service');
        const { isRunningOnCloudRun } = await loadModule();
        expect(isRunningOnCloudRun()).toBe(true);
    });

    // --- 準正常系 ---

    it('K_SERVICE がなければ false（ローカル・テスト）', async () => {
        vi.stubEnv('K_SERVICE', '');
        const { isRunningOnCloudRun } = await loadModule();
        expect(isRunningOnCloudRun()).toBe(false);
    });
});
