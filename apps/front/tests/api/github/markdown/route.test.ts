// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/github/markdown/route';
import type { NextRequest } from 'next/server';

/**
 * GitHub Markdown プロキシのルートハンドラ。
 * 外部 I/O は global.fetch（GitHub API）と環境変数のみ。fetch のみモックする。
 */
const makeReq = (body: unknown): NextRequest =>
    ({
        json: async () => {
            if (body === undefined) throw new Error('invalid json');
            return body;
        },
    }) as unknown as NextRequest;

// fetch のレスポンスを作る
const fetchResult = (status: number, text: string) => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
});

const VALID_URL = 'https://github.com/kojikawazu/zenn-article-kk/blob/main/articles/39-x.md';
const MD = '---\ntitle: x\n---\n# 本文\nzenn記事の本文';

describe('POST /api/github/markdown', () => {
    beforeEach(() => {
        vi.stubEnv('GITHUB_TOKEN', 'ghp_validlooking');
        vi.stubEnv('ALLOWED_REPO_OWNER', 'kojikawazu');
    });
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    // --- 正常系 ---

    it('トークンが有効ならフロントマターを除去した本文を返す', async () => {
        const fetchMock = vi.fn().mockResolvedValue(fetchResult(200, MD));
        global.fetch = fetchMock as unknown as typeof fetch;

        const res = await POST(makeReq({ url: VALID_URL }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.content).toContain('zenn記事の本文');
        expect(json.content).not.toContain('title: x'); // フロントマター除去
        // 1回目から Authorization 付きで呼ばれる
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const headers = fetchMock.mock.calls[0][1].headers;
        expect(headers.Authorization).toBe('Bearer ghp_validlooking');
    });

    it('トークンが401でも無認証フォールバックで再取得して本文を返す', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(fetchResult(401, 'Bad credentials'))
            .mockResolvedValueOnce(fetchResult(200, MD));
        global.fetch = fetchMock as unknown as typeof fetch;

        const res = await POST(makeReq({ url: VALID_URL }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.content).toContain('zenn記事の本文');
        // 2回呼ばれ、2回目は Authorization なし
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][1].headers.Authorization).toBeUndefined();
    });

    // --- 準正常系（想定内の異常入力） ---

    it('許可外オーナーのURLは403を返す（fetchを呼ばない）', async () => {
        const fetchMock = vi.fn();
        global.fetch = fetchMock as unknown as typeof fetch;

        const res = await POST(
            makeReq({ url: 'https://github.com/someoneelse/repo/blob/main/a.md' }),
        );

        expect(res.status).toBe(403);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('URL形式が不正なら400を返す', async () => {
        const res = await POST(makeReq({ url: 'https://zenn.dev/kojikawazu/articles/abc' }));
        expect(res.status).toBe(400);
    });

    it('url フィールドが無ければ400を返す', async () => {
        const res = await POST(makeReq({ noturl: 1 }));
        expect(res.status).toBe(400);
    });

    // --- 異常系 ---

    it('トークンあり・401フォールバックも失敗ならそのステータスでエラーを返す', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(fetchResult(401, 'Bad credentials'))
            .mockResolvedValueOnce(fetchResult(404, 'Not Found'));
        global.fetch = fetchMock as unknown as typeof fetch;

        const res = await POST(makeReq({ url: VALID_URL }));
        const json = await res.json();

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(res.status).toBe(404);
        expect(json.error).toBe('Failed to fetch Markdown content from GitHub');
    });

    it('JSONボディが不正なら400を返す', async () => {
        const res = await POST(makeReq(undefined));
        expect(res.status).toBe(400);
    });
});
