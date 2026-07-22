/**
 * 認証ユーザーのデータ型。ログイン中ユーザーの情報を表す。
 */
export interface User {
    /** ユーザーの一意な ID */
    id: string;
    /** 表示名 */
    name: string;
    /** メールアドレス（ログイン ID） */
    email: string;
    /** 作成日時（ISO 8601 文字列） */
    created_at: string;
    /** 更新日時（ISO 8601 文字列） */
    updated_at: string;
}
