// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * バックエンドへのプロキシ。外部 I/O はメタデータサーバー・バックエンドへの global.fetch と環境変数のみで、
 * fetch のみモックする（ID トークンの取得・キャッシュ、クライアント IP の抽出は実物を通す）。
 * ID トークンのキャッシュを分離するため、テストごとにモジュールを読み直す。
 */
const BACKEND = 'https://backend.test';
const METADATA_PREFIX = 'http://metadata.google.internal/';
const NOW_MS = Date.UTC(2026, 9, 13, 0, 0, 0);
const ID_TOKEN = `header.${Buffer.from(JSON.stringify({ exp: NOW_MS / 1000 + 3600 })).toString('base64url')}.signature`;

/** fetch の応答を模す（proxyToBackend が読む status / text / headers のみ） */
const response = (status: number, text: string) => ({
    status,
    ok: status >= 200 && status < 300,
    text: async () => text,
    headers: new Headers(),
});

/** メタデータサーバーとバックエンドを URL で振り分ける fetch のモック */
const mockFetch = (metadata: () => Promise<unknown>) =>
    vi.fn<(url: string, init?: RequestInit) => Promise<unknown>>((url) =>
        url.startsWith(METADATA_PREFIX) ? metadata() : Promise.resolve(response(200, '[]')),
    );

const req = (headers: Record<string, string> = {}) =>
    new NextRequest('http://localhost/api/blogs', { method: 'GET', headers });

const loadProxy = async () => {
    vi.resetModules();
    return (await import('@/app/api/_lib/proxy')).proxyToBackend;
};

/** バックエンドへの呼び出しで送ったヘッダを返す */
const backendHeaders = (fetchMock: ReturnType<typeof mockFetch>) => {
    const call = fetchMock.mock.calls.find(([url]) => url.startsWith(BACKEND));
    // proxyToBackend はヘッダをプレーンオブジェクトで渡すため、Record として比較できる
    return call?.[1]?.headers as Record<string, string> | undefined;
};

describe('proxyToBackend（ID トークン・クライアント IP の付与）', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW_MS);
        vi.stubEnv('BACKEND_API_URL', `${BACKEND}/api`);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('Cloud Run 上では ID トークン（audience はバックエンドの origin）と X-Client-IP を付けて転送する', async () => {
        vi.stubEnv('K_SERVICE', 'front');
        const fetchMock = mockFetch(() => Promise.resolve(response(200, ID_TOKEN)));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        const res = await proxyToBackend(req({ 'x-forwarded-for': '203.0.113.1' }), '/blogs');

        expect(res.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('audience=https%3A%2F%2Fbackend.test'),
            expect.anything(),
        );
        expect(fetchMock).toHaveBeenCalledWith(`${BACKEND}/api/blogs`, expect.anything());
        expect(backendHeaders(fetchMock)).toEqual({
            Authorization: `Bearer ${ID_TOKEN}`,
            'X-Client-IP': '203.0.113.1',
        });
    });

    // --- 準正常系 ---

    it('ローカル（K_SERVICE なし）では ID トークンを取得せず、Authorization を付けない', async () => {
        vi.stubEnv('K_SERVICE', '');
        const fetchMock = mockFetch(() => Promise.reject(new Error('must not be called')));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        const res = await proxyToBackend(req({ 'x-forwarded-for': '203.0.113.1' }), '/blogs');

        expect(res.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(backendHeaders(fetchMock)).toEqual({ 'X-Client-IP': '203.0.113.1' });
    });

    it('X-Forwarded-For の左端を偽装しても、右端（接続元）を X-Client-IP にする', async () => {
        vi.stubEnv('K_SERVICE', '');
        const fetchMock = mockFetch(() => Promise.reject(new Error('must not be called')));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        await proxyToBackend(req({ 'x-forwarded-for': '198.51.100.1, 203.0.113.1' }), '/blogs');

        expect(backendHeaders(fetchMock)).toEqual({ 'X-Client-IP': '203.0.113.1' });
    });

    it('クライアント IP を取れない場合は X-Client-IP を付けない', async () => {
        vi.stubEnv('K_SERVICE', '');
        const fetchMock = mockFetch(() => Promise.reject(new Error('must not be called')));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        await proxyToBackend(req({ 'x-forwarded-for': 'not-an-ip' }), '/blogs');

        expect(backendHeaders(fetchMock)).toEqual({});
    });

    // --- 異常系 ---

    it('ID トークンの取得に失敗したらバックエンドを呼ばず 500 を返す', async () => {
        vi.stubEnv('K_SERVICE', 'front');
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = mockFetch(() => Promise.resolve(response(503, 'unavailable')));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        const res = await proxyToBackend(req({ 'x-forwarded-for': '203.0.113.1' }), '/blogs');

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({ error: 'Backend authentication failed' });
        expect(backendHeaders(fetchMock)).toBeUndefined();
        expect(console.error).toHaveBeenCalledWith(
            'Failed to obtain ID token for backend',
            expect.any(Error),
        );
    });

    it('メタデータサーバーに接続できない場合もバックエンドを呼ばず 500 を返す', async () => {
        vi.stubEnv('K_SERVICE', 'front');
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = mockFetch(() => Promise.reject(new TypeError('fetch failed')));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        const res = await proxyToBackend(req(), '/blogs');

        expect(res.status).toBe(500);
        expect(backendHeaders(fetchMock)).toBeUndefined();
    });

    it('BACKEND_API_URL が URL として解釈できない場合も 500 を返す', async () => {
        vi.stubEnv('K_SERVICE', 'front');
        vi.stubEnv('BACKEND_API_URL', 'not a url');
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const fetchMock = mockFetch(() => Promise.resolve(response(200, ID_TOKEN)));
        global.fetch = fetchMock as unknown as typeof fetch;
        const proxyToBackend = await loadProxy();

        const res = await proxyToBackend(req(), '/blogs');

        expect(res.status).toBe(500);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
