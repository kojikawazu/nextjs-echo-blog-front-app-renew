import { NextRequest, NextResponse } from 'next/server';

/**
 * バックエンドAPIへのプロキシリクエスト。
 * サーバーサイドでのみ実行され、バックエンドURLをクライアントに露出しない。
 *
 * Note: Next.js 16では req.text() + new NextResponse() パターンで
 * POSTルートが404になるバグがあるため、req.json() + NextResponse.json() を使用。
 *
 * @param req - クライアントからの受信リクエスト（Cookie・ボディを転送元とする）
 * @param backendPath - バックエンド上の転送先パス（例: `/blogs/detail/:id`）
 * @param options - 任意設定。`method` で HTTP メソッドを上書きできる（未指定時は `req.method`）
 * @returns バックエンドの応答を整形した JSON レスポンス。`BACKEND_API_URL` 未設定時は 500
 */
export async function proxyToBackend(
    req: NextRequest,
    backendPath: string,
    options?: { method?: string },
): Promise<NextResponse> {
    const backendApiUrl = process.env.BACKEND_API_URL;
    if (!backendApiUrl) {
        return NextResponse.json({ error: 'Backend API URL is not configured' }, { status: 500 });
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
        try {
            const body = await req.json();
            fetchOptions.body = JSON.stringify(body);
        } catch {
            // ボディなし or JSON以外（DELETEなど）
        }
    }

    const backendRes = await fetch(`${backendApiUrl}${backendPath}`, fetchOptions);

    const status = backendRes.status;

    // 204 No Content
    if (status === 204) {
        const nextRes = NextResponse.json(null, { status: 204 });
        for (const cookie of backendRes.headers.getSetCookie()) {
            nextRes.headers.append('Set-Cookie', cookie);
        }
        return nextRes;
    }

    // レスポンスを読み取り（bodyは1回しか読めないため、textで読んでからJSON parseを試みる）
    const responseText = await backendRes.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch {
        data = responseText || null;
    }

    const nextRes = NextResponse.json(data, { status });

    // バックエンドからのSet-Cookieヘッダーをクライアントに転送（認証Cookie等）
    for (const cookie of backendRes.headers.getSetCookie()) {
        nextRes.headers.append('Set-Cookie', cookie);
    }

    return nextRes;
}
