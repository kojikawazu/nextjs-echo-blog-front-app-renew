import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function GET(req: NextRequest) {
    const res = await proxyToBackend(req, '/users/auth-check');

    // 未認証（401/404）の場合は200+nullで返し、ブラウザのコンソールエラーを抑止
    if (!res.ok) {
        return NextResponse.json(null, { status: 200 });
    }

    return res;
}
