import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ count: string }> }) {
    const { count } = await params;
    return proxyToBackend(req, `/blogs/popular/${count}`);
}
