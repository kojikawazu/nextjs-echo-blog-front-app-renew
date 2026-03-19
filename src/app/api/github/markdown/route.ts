import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';

const ALLOWED_OWNER = process.env.ALLOWED_REPO_OWNER;

/**
 * GitHub Markdown取得プロキシ
 * - GITHUB_TOKENをサーバーサイドでのみ使用し、クライアントに露出しない
 * - GITHUB_ALLOWED_OWNERで許可されたオーナーのリポジトリのみアクセス可能
 * - 許可外オーナーのリポジトリへのリクエストはトークンなしで実行（プライベートリポ漏洩防止）
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

    // GITHUB_TOKEN があるのに ALLOWED_REPO_OWNER が未設定の場合は fail-closed
    // 設定漏れでトークンが任意リポに使われることを防止
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken && !ALLOWED_OWNER) {
        return NextResponse.json(
            { error: 'ALLOWED_REPO_OWNER is not configured' },
            { status: 500 },
        );
    }

    // 許可されたオーナーのリポジトリのみアクセス可能
    if (ALLOWED_OWNER && owner !== ALLOWED_OWNER) {
        return NextResponse.json({ error: 'Repository owner not allowed' }, { status: 403 });
    }
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3.raw',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    };

    const response = await fetch(apiUrl, { headers });

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
