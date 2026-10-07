'use client';

import { useEffect, useState } from 'react';
// lib
import { fetchMarkdown } from '@/app/lib/api/github/fetchGitHub';

/**
 * Markdown 本文の取得状態。
 */
type MarkdownStatus =
    /** 取得対象の URL がなく、取得を開始していない */
    | 'idle'
    /** 取得中 */
    | 'loading'
    /** 取得失敗（プロキシが `null` を返した・通信エラー）。画面は GitHub へのリンクを出す */
    | 'error'
    /** 取得完了 */
    | 'done';

/** GitHub 上の Markdown 本文の取得結果。 */
type UseBlogMarkdownResult = {
    /** Markdown 本文。未取得・失敗時は `null` */
    markdown: string | null;
    /** 取得状態 */
    status: MarkdownStatus;
};

/**
 * ブログ本文の Markdown を GitHub から（BFF 経由で）取得する。
 * URL が変わると取り直し、アンマウント・URL 変更後に届いた古い結果は捨てる。
 *
 * @param githubUrl - 本文 Markdown の GitHub blob URL。`undefined` / 空文字なら取得しない
 * @returns 本文と取得状態
 */
export function useBlogMarkdown(githubUrl: string | undefined): UseBlogMarkdownResult {
    const [markdown, setMarkdown] = useState<string | null>(null);
    const [status, setStatus] = useState<MarkdownStatus>('idle');

    useEffect(() => {
        if (!githubUrl) {
            return;
        }
        let cancelled = false;
        setStatus('loading');
        (async () => {
            try {
                const content = await fetchMarkdown(githubUrl);
                if (cancelled) return;
                if (content) {
                    setMarkdown(content);
                    setStatus('done');
                } else {
                    // 取得失敗（プロキシが null を返却。トークン失効・404 等）→ 無言の空白を避ける
                    setStatus('error');
                }
            } catch {
                if (!cancelled) setStatus('error');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [githubUrl]);

    return { markdown, status };
}
