import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

/**
 * バックエンドAPIへのプロキシリクエスト
 * サーバーサイドでのみ実行され、バックエンドURLをクライアントに露出しない
 */
export async function proxyToBackend(
    req: NextRequest,
    backendPath: string,
    options?: { method?: string },
): Promise<NextResponse> {
    if (!BACKEND_API_URL) {
        return NextResponse.json(
            { error: 'Backend API URL is not configured' },
            { status: 500 },
        );
    }

    const method = options?.method || req.method;

    // クライアントから受け取ったCookieをバックエンドに転送
    const cookieHeader = req.headers.get('cookie') || '';
    const headers: HeadersInit = {};

    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    const contentType = req.headers.get('content-type');
    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    const fetchOptions: RequestInit = { method, headers };

    // GET/HEAD以外はリクエストボディを転送
    if (method !== 'GET' && method !== 'HEAD') {
        const body = await req.text();
        if (body) {
            fetchOptions.body = body;
        }
    }

    const backendRes = await fetch(`${BACKEND_API_URL}${backendPath}`, fetchOptions);

    const status = backendRes.status;
    const responseBody = status === 204 ? null : await backendRes.text();

    const nextRes = new NextResponse(responseBody, { status });

    // Content-Typeを転送
    const resContentType = backendRes.headers.get('content-type');
    if (resContentType) {
        nextRes.headers.set('Content-Type', resContentType);
    }

    // バックエンドからのSet-Cookieヘッダーをクライアントに転送（認証Cookie等）
    const setCookies = backendRes.headers.getSetCookie();
    for (const cookie of setCookies) {
        nextRes.headers.append('Set-Cookie', cookie);
    }

    return nextRes;
}
