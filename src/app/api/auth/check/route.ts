import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function GET(req: NextRequest) {
    const res = await proxyToBackend(req, '/users/auth-check');

    // バックエンドが未認証時に404を返す場合、401に変換
    if (res.status === 404) {
        return NextResponse.json(null, { status: 401 });
    }

    return res;
}
