import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/app/api/_lib/proxy';

export async function GET(req: NextRequest) {
    return proxyToBackend(req, '/blogs');
}

export async function POST(req: NextRequest) {
    return proxyToBackend(req, '/blogs/create');
}
