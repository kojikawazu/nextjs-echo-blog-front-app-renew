// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * メールアドレスとパスワードでログインする。成功時はバックエンドが認証 Cookie を発行する。
 *
 * @param email - ログイン ID となるメールアドレス
 * @param password - パスワード
 * @throws {Error} 認証失敗などエラーステータスが返った場合（メッセージは `TOAST_LOGIN_ERROR`）
 */
export async function login(email: string, password: string): Promise<void> {
    const response = await fetch(COMMON_CONSTANTS.URL.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.AUTH.TOAST_LOGIN_ERROR);
    }
    // 成功時の本文は利用しないため読まない（認証 Cookie の発行・破棄がこの API の結果）
}
