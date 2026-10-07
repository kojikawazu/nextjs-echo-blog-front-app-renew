// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import type { User } from '@/app/types/users';

/**
 * 認証状態を確認し、ログイン中のユーザー情報を取得する。BFF 経由で Cookie を転送する。
 *
 * BFF は未認証時に `200 + null` を返すため、エラーステータスと本文 `null` の双方を
 * 「未認証」として `null` に正規化する。
 *
 * @returns ログイン中ユーザー。未認証の場合は `null`
 * @throws {Error} ネットワーク障害・JSON パース失敗の場合（fetch / json 由来の例外をそのまま伝播）
 */
export async function fetchAuthUser(): Promise<User | null> {
    const response = await fetch(COMMON_CONSTANTS.URL.AUTH_CHECK, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data) return null;

    return {
        id: data.user_id,
        name: data.username,
        email: data.email,
        // auth-check のレスポンスは日時を含まないため空文字で埋める
        created_at: '',
        updated_at: '',
    };
}
