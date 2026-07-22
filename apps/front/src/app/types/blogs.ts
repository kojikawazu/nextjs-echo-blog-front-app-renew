/**
 * ブログ記事のデータ型。バックエンド API のレスポンス／一覧・詳細表示の基本単位。
 */
export interface Blog {
    /** ブログの一意な ID（UUID） */
    id: string;
    /** 投稿者（オーナー）のユーザー ID */
    user_id: string;
    /** 記事タイトル */
    title: string;
    /** 本文 Markdown を配置した GitHub の blob URL（未設定可） */
    github_url?: string;
    /** カテゴリ名 */
    category: string;
    /** タグ名の配列 */
    tags: string[];
    /** 記事の概要文（一覧カード等に表示） */
    description: string;
    /** いいね数 */
    likes: number;
    /** コメント件数 */
    comment_cnt: number;
    /** 作成日時（ISO 8601 文字列） */
    created_at: string;
    /** 更新日時（ISO 8601 文字列） */
    updated_at: string;
}

/**
 * ブログへのコメントのデータ型。ゲスト投稿を含む。
 */
export interface Comment {
    /** コメントの一意な ID */
    id: string;
    /** 紐づくブログの ID */
    blog_id: string;
    /** 投稿者名（ゲスト名） */
    guest_user: string;
    /** コメント本文 */
    comment: string;
    /** 返信先コメントの ID（トップレベルは未設定）。返信機能は未実装で型のみ存在 */
    parent_id?: string;
    /** 作成日時（ISO 8601 文字列） */
    created_at: string;
}

/**
 * ブログのいいね（訪問者単位）のデータ型。訪問者 ID で重複いいねを防ぐ。
 */
export interface BlogLike {
    /** いいねレコードの一意な ID */
    id: string;
    /** いいね対象のブログ ID */
    blog_id: string;
    /** いいねした訪問者の ID */
    visit_id: string;
    /** 作成日時（ISO 8601 文字列） */
    created_at: string;
    /** 更新日時（ISO 8601 文字列） */
    updated_at: string;
}
