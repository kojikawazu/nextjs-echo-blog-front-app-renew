import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLikeBlog } from '@/app/hooks/useLikeBlog';
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * #159 の回帰テスト: 訪問者 ID の発行が終わってから、いいね一覧を取得すること。
 *
 * 不具合は「発行と一覧取得が並行して走り、Cookie の無い一覧取得が 401 になる」という
 * 呼び出し順の問題のため、フック〜API アクセス層を実物で通し、外部 I/O である fetch だけを
 * 偽バックエンドに差し替える。リトライは無効にし、401 をリトライで隠さない。
 */

const LIKES_URL = COMMON_CONSTANTS.URL.BLOG_LIKE_FETCH_LIKED_BLOGS;
const VISIT_ID_URL = COMMON_CONSTANTS.URL.BLOG_LIKE_GENERATE_VISIT_ID;

/** 発行完了を待たずに一覧を取得していないかを確かめるため、発行を保留したまま待つ時間（ミリ秒） */
const PENDING_WAIT_MS = 50;

/** 偽バックエンドの設定 */
type FakeBackendOptions = {
    /** いいね済みのブログ ID */
    liked: string[];
    /** 訪問者 ID の発行 API が返すステータス。省略時は 200 */
    visitIdStatus?: number;
    /** 指定すると、発行 API はこの Promise が解決するまで応答しない（発行中の状態を作る） */
    visitIdGate?: Promise<void>;
};

/**
 * 訪問者 Cookie の有無を再現する偽バックエンドを fetch に差し込む。
 * 発行 API が 200 を返した時点で Cookie が付いたとみなし、それより前の一覧取得には
 * 実バックエンドと同じく 401 を返す。
 *
 * @param options - 偽バックエンドの設定
 * @returns いいね一覧の取得結果（ステータス）を呼ばれた順に記録した配列
 */
const installFakeBackend = ({ liked, visitIdStatus = 200, visitIdGate }: FakeBackendOptions) => {
    let hasVisitorCookie = false;
    const likesStatuses: number[] = [];
    const respond = (status: number, body: unknown) =>
        ({ ok: status < 400, status, json: async () => body }) as Response;

    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            const method = init?.method ?? 'GET';
            if (url === VISIT_ID_URL) {
                await visitIdGate;
                if (visitIdStatus !== 200) {
                    return respond(visitIdStatus, { error: 'internal' });
                }
                hasVisitorCookie = true;
                return respond(200, { message: 'Visitor id generated' });
            }
            if (url === LIKES_URL && method === 'GET') {
                const status = hasVisitorCookie ? 200 : 401;
                likesStatuses.push(status);
                return status === 200
                    ? respond(
                          200,
                          liked.map((blog_id) => ({ blog_id })),
                      )
                    : respond(401, { error: 'VISITOR_TOKEN_MISSING' });
            }
            throw new Error(`想定外のリクエスト: ${method} ${url}`);
        }),
    );
    return likesStatuses;
};

const setup = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
    const hook = renderHook(() => useLikeBlog(), { wrapper });
    return { ...hook, queryClient };
};

describe('useLikeBlog（訪問者 ID の発行を待つ・#159 回帰）', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // --- 正常系 ---

    it('発行が終わるまでいいね一覧を取得せず、終わってから 1 回だけ取得する', async () => {
        let openGate: () => void = () => {};
        const visitIdGate = new Promise<void>((resolve) => {
            openGate = resolve;
        });
        const likesStatuses = installFakeBackend({ liked: ['blog-1'], visitIdGate });
        const { result } = setup();

        await new Promise((r) => setTimeout(r, PENDING_WAIT_MS));
        expect(likesStatuses).toEqual([]);

        openGate();

        await waitFor(() => expect(result.current.hasLiked('blog-1')).toBe(true));
        expect(likesStatuses).toEqual([200]);
    });

    // --- 準正常系 ---

    it('初回訪問（Cookie なし）でも、いいね一覧の取得は 401 を経ずに 1 回で成功する', async () => {
        const likesStatuses = installFakeBackend({ liked: ['blog-1', 'blog-2'] });
        const { result, queryClient } = setup();

        await waitFor(() =>
            expect(queryClient.getQueryState(['likedBlogs'])?.status).toBe('success'),
        );
        expect(likesStatuses).toEqual([200]);
        expect(result.current.hasLiked('blog-1')).toBe(true);
        expect(result.current.hasLiked('blog-2')).toBe(true);
    });

    it('発行に失敗すると、いいね一覧を取得せず hasLiked はすべて false になる', async () => {
        const likesStatuses = installFakeBackend({ liked: ['blog-1'], visitIdStatus: 500 });
        const { result, queryClient } = setup();

        await waitFor(() => expect(queryClient.getQueryState(['visitId'])?.status).toBe('error'));
        await new Promise((r) => setTimeout(r, PENDING_WAIT_MS));
        expect(likesStatuses).toEqual([]);
        expect(result.current.hasLiked('blog-1')).toBe(false);
    });
});
