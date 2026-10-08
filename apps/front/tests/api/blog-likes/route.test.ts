// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/blog-likes/route';

/**
 * いいね済み一覧の BFF ルート。外部 I/O はバックエンドへの global.fetch と環境変数のみで、
 * fetch のみモックする（proxyToBackend の Cookie 転送・本文整形は実物を通す）。
 */
const BACKEND = 'http://backend.test';

/** バックエンド応答を模す。Set-Cookie の転送を検証できるよう Headers を実物で組み立てる */
const backendResponse = (status: number, text: string, setCookie?: string) => {
    const headers = new Headers();
    if (setCookie) headers.append('Set-Cookie', setCookie);
    return { status, ok: status >= 200 && status < 300, text: async () => text, headers };
};

const req = () =>
    new NextRequest('http://localhost/api/blog-likes', {
        method: 'GET',
        headers: { cookie: 'visit-id-token=t' },
    });

describe('GET /api/blog-likes', () => {
    beforeEach(() => {
        vi.stubEnv('BACKEND_API_URL', BACKEND);
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('いいね済み一覧（配列）はそのまま返し、Cookie をバックエンドへ転送する', async () => {
        const likes = [{ blog_id: 'b1' }, { blog_id: 'b2' }];
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                backendResponse(200, JSON.stringify(likes)),
            ) as unknown as typeof fetch;

        const res = await GET(req());

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual(likes);
        expect(global.fetch).toHaveBeenCalledWith(
            `${BACKEND}/blog-likes`,
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({ Cookie: 'visit-id-token=t' }),
            }),
        );
    });

    // --- 準正常系 ---

    it('バックエンドが null（いいね 0 件）を返したら空配列に正規化する（#17）', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(backendResponse(200, 'null')) as unknown as typeof fetch;

        const res = await GET(req());

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual([]);
    });

    it('null を正規化するときもバックエンドの Set-Cookie を引き継ぐ', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                backendResponse(200, 'null', 'visit-id-token=new; Path=/'),
            ) as unknown as typeof fetch;

        const res = await GET(req());

        expect(res.headers.getSetCookie()).toEqual(['visit-id-token=new; Path=/']);
        await expect(res.json()).resolves.toEqual([]);
    });

    it('空配列はそのまま空配列で返す', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(backendResponse(200, '[]')) as unknown as typeof fetch;

        const res = await GET(req());

        await expect(res.json()).resolves.toEqual([]);
    });

    // --- 異常系 ---

    it('バックエンドのエラー応答はステータス・本文を変えずに返す（[] に化けさせない）', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValue(
                backendResponse(500, JSON.stringify({ error: 'Failed to get visit id token' })),
            ) as unknown as typeof fetch;

        const res = await GET(req());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({ error: 'Failed to get visit id token' });
    });

    it('BACKEND_API_URL 未設定なら 500 を返しバックエンドを呼ばない', async () => {
        vi.stubEnv('BACKEND_API_URL', '');
        global.fetch = vi.fn() as unknown as typeof fetch;

        const res = await GET(req());

        expect(res.status).toBe(500);
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
