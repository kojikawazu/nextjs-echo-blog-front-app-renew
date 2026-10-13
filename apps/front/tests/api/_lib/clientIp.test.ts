// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp } from '@/app/api/_lib/clientIp';

/**
 * クライアント IP の抽出。純粋な関数のためモックしない。
 */
const req = (xff?: string) =>
    new NextRequest('http://localhost/api/blogs', {
        headers: xff === undefined ? {} : { 'x-forwarded-for': xff },
    });

describe('getClientIp', () => {
    it.each([
        // --- 正常系 ---
        { name: 'IPv4 が 1 つならそれを返す', xff: '203.0.113.1', want: '203.0.113.1' },
        { name: 'IPv6 を返す', xff: '2001:db8::1', want: '2001:db8::1' },
        // --- 準正常系 ---
        {
            name: '複数あれば右端（Cloud Run が付与した接続元）を返し、左側の偽装を使わない',
            xff: '198.51.100.1, 203.0.113.1',
            want: '203.0.113.1',
        },
        { name: '前後の空白を取り除く', xff: '198.51.100.1,  203.0.113.1 ', want: '203.0.113.1' },
        { name: 'ヘッダがなければ null', xff: undefined, want: null },
        { name: '空文字なら null', xff: '', want: null },
        // --- 異常系 ---
        { name: '右端が IP でなければ null', xff: '203.0.113.1, not-an-ip', want: null },
        { name: '右端が空（末尾カンマ）なら null', xff: '203.0.113.1,', want: null },
    ])('$name', ({ xff, want }) => {
        expect(getClientIp(req(xff))).toBe(want);
    });
});
