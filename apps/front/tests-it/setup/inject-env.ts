import { inject } from 'vitest';

/**
 * globalSetup が provide した `backendApiUrl` を、各テストワーカーの
 * `process.env.BACKEND_API_URL` に反映する。
 *
 * BFF の `proxyToBackend` は呼び出し時に `process.env.BACKEND_API_URL` を読むため、
 * fork プールでもワーカー側で環境変数を確実に設定する必要がある。
 */
process.env.BACKEND_API_URL = inject('backendApiUrl');
