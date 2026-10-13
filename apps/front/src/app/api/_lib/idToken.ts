import { z } from 'zod';

/** Cloud Run のメタデータサーバーで、実行サービスアカウントの ID トークンを発行するエンドポイント */
const METADATA_IDENTITY_URL =
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';

/** 有効期限のこの時間前にトークンを取り直す（ミリ秒）。転送中に期限切れになるのを防ぐ */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/** ID トークン（JWT）のペイロードのうち、キャッシュの期限に使う部分。`exp` は UNIX 時刻（秒） */
const idTokenPayloadSchema = z.object({ exp: z.number() });

/** キャッシュした ID トークン */
type CachedIdToken = {
    /** ID トークン（JWT） */
    token: string;
    /** 発行時に指定した audience */
    audience: string;
    /** 有効期限（UNIX 時刻・ミリ秒） */
    expiresAtMs: number;
};

let cached: CachedIdToken | null = null;
let inflight: { audience: string; promise: Promise<string> } | null = null;

/**
 * Cloud Run 上で動いているかを返す。
 * `K_SERVICE` は Cloud Run が自動で設定する環境変数で、ローカル・テストでは未設定。
 *
 * @returns Cloud Run 上なら true
 */
export function isRunningOnCloudRun(): boolean {
    return Boolean(process.env.K_SERVICE);
}

/**
 * バックエンド（非公開の Cloud Run）を呼ぶための ID トークンを返す。
 * メタデータサーバーから取得し、有効期限の 5 分前までキャッシュする。同時の呼び出しは 1 回の取得にまとめる。
 *
 * @param audience - トークンの宛先（バックエンドの URL の origin）
 * @returns ID トークン（JWT）
 * @throws メタデータサーバーの応答が 2xx でない、またはトークンの形式が不正な場合（キャッシュしない）
 */
export async function getBackendIdToken(audience: string): Promise<string> {
    if (
        cached &&
        cached.audience === audience &&
        Date.now() < cached.expiresAtMs - REFRESH_MARGIN_MS
    ) {
        return cached.token;
    }
    if (inflight && inflight.audience === audience) {
        return inflight.promise;
    }

    const promise = fetchIdToken(audience).finally(() => {
        if (inflight?.promise === promise) {
            inflight = null;
        }
    });
    inflight = { audience, promise };
    return promise;
}

/**
 * メタデータサーバーから ID トークンを取得してキャッシュする。
 *
 * @param audience - トークンの宛先
 * @returns ID トークン（JWT）
 */
async function fetchIdToken(audience: string): Promise<string> {
    const res = await fetch(`${METADATA_IDENTITY_URL}?audience=${encodeURIComponent(audience)}`, {
        headers: { 'Metadata-Flavor': 'Google' },
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch ID token from metadata server: status ${res.status}`);
    }

    const token = (await res.text()).trim();
    cached = { token, audience, expiresAtMs: parseExpiresAtMs(token) };
    return token;
}

/**
 * ID トークン（JWT）のペイロードから有効期限を読む。署名は検証しない（検証はバックエンドの Cloud Run が行う）。
 *
 * @param token - ID トークン（JWT）
 * @returns 有効期限（UNIX 時刻・ミリ秒）
 * @throws JWT の形式でない、または `exp` を持たない場合
 */
function parseExpiresAtMs(token: string): number {
    const payload = token.split('.')[1];
    if (!payload) {
        throw new Error('Invalid ID token format');
    }
    const json: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return idTokenPayloadSchema.parse(json).exp * 1000;
}
