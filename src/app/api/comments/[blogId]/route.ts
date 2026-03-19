import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ blogId: string }> },
) {
    const { blogId } = await params;
    return proxyToBackend(req, `/comments/blog/${blogId}`);
}
