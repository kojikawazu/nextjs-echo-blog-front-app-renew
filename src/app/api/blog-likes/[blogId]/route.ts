import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ blogId: string }> },
) {
    const { blogId } = await params;
    return proxyToBackend(req, `/blog-likes/create/${blogId}`);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ blogId: string }> },
) {
    const { blogId } = await params;
    return proxyToBackend(req, `/blog-likes/delete/${blogId}`);
}
