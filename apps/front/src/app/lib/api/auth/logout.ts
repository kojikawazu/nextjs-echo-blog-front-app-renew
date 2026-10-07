// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * ログアウトする。バックエンドが認証 Cookie を破棄する。
 *
 * @throws {Error} エラーステータスが返った場合（メッセージは `TOAST_LOGOUT_ERROR`）
 */
export async function logout(): Promise<void> {
    const response = await fetch(COMMON_CONSTANTS.URL.LOGOUT, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.AUTH.TOAST_LOGOUT_ERROR);
    }
    // 成功時の本文は利用しないため読まない（認証 Cookie の発行・破棄がこの API の結果）
}
