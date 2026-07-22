import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';

/**
 * GitHub Markdown取得プロキシ（Route Handler）。
 * - GITHUB_TOKENをサーバーサイドでのみ使用し、クライアントに露出しない
 * - ALLOWED_REPO_OWNERで許可されたオーナーのリポジトリのみアクセス可能
 * - 許可外オーナーのリポジトリへのリクエストはトークンなしで実行（プライベートリポ漏洩防止）
 *
 * @param req - `{ url: string }`（GitHub の Markdown blob URL）を含む POST リクエスト
 * @returns Markdown 本文の JSON。入力不正は 400、設定不備は 500、取得失敗は該当ステータス
 */
export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || !('url' in body)) {
        return NextResponse.json({ error: 'url field is required' }, { status: 400 });
    }

    const { url } = body as { url: unknown };
    if (typeof url !== 'string') {
        return NextResponse.json({ error: 'url must be a string' }, { status: 400 });
    }

    const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/main\/(.+\.md)$/;
    const match = url.match(regex);

    if (!match) {
        return NextResponse.json({ error: 'Invalid GitHub Markdown URL format' }, { status: 400 });
    }

    const owner = match[1];
    const repo = match[2];
    const path = match[3];

    // 環境変数を関数内で読み取り（Next.js 16対応）
    const githubToken = process.env.GITHUB_TOKEN;
    const allowedOwner = process.env.ALLOWED_REPO_OWNER?.trim();

    // GITHUB_TOKEN があるのに ALLOWED_REPO_OWNER が未設定の場合は fail-closed
    // 設定漏れでトークンが任意リポに使われることを防止
    if (githubToken && !allowedOwner) {
        return NextResponse.json(
            { error: 'ALLOWED_REPO_OWNER is not configured' },
            { status: 500 },
        );
    }

    // 許可されたオーナーのリポジトリのみアクセス可能
    if (allowedOwner && owner !== allowedOwner) {
        return NextResponse.json({ error: 'Repository owner not allowed' }, { status: 403 });
    }
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const baseHeaders: HeadersInit = {
        Accept: 'application/vnd.github.v3.raw',
    };

    // トークンがあれば付与して取得
    let response = await fetch(apiUrl, {
        headers: githubToken
            ? { ...baseHeaders, Authorization: `Bearer ${githubToken}` }
            : baseHeaders,
    });

    // トークンが失効・権限切れ（401/403）の場合、公開リポジトリ向けに無認証で再取得する。
    // オーナーは ALLOWED_REPO_OWNER で制限済みのため、無認証で読めるのは公開リポのみ＝private 漏洩リスクはない。
    if (githubToken && (response.status === 401 || response.status === 403)) {
        response = await fetch(apiUrl, { headers: baseHeaders });
    }

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Failed to fetch Markdown content from GitHub' },
            { status: response.status },
        );
    }

    const rawContent = await response.text();
    const { content } = matter(rawContent);

    return NextResponse.json({ content });
}
