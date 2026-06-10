# データ仕様書（Data Specification）

## 目次

- [1. 型定義](#1-型定義)
    - [Blog](#blog)
    - [Comment](#comment)
    - [BlogLike](#bloglike)
    - [User](#user)
- [2. バリデーションスキーマ（Zod）](#2-バリデーションスキーマzod)
    - [ログインフォーム](#ログインフォーム)
    - [新規登録フォーム](#新規登録フォーム)
    - [ブログ作成フォーム](#ブログ作成フォーム)
    - [ブログ編集フォーム](#ブログ編集フォーム)
    - [コメント投稿フォーム](#コメント投稿フォーム)
- [3. データ変換処理](#3-データ変換処理)
    - [ブログ一覧取得時の変換（`fetchBlogs.ts`）](#ブログ一覧取得時の変換fetchblogsts)
    - [ブログ作成/更新時の変換](#ブログ作成更新時の変換)
- [4. 状態管理](#4-状態管理)
    - [React Context](#react-context)
    - [TanStack Query キャッシュキー](#tanstack-query-キャッシュキー)
    - [Zustand Store（開発用サンプル）](#zustand-store開発用サンプル)

## 1. 型定義

### Blog

ブログ記事を表すデータモデル。

```typescript
// src/app/types/blogs.ts
interface Blog {
    id: string;          // ブログID（UUID）
    user_id: string;     // 投稿者のユーザーID
    title: string;       // 記事タイトル
    github_url?: string; // GitHub MarkdownファイルのURL（任意）
    category: string;    // カテゴリ名
    tags: string[];      // タグ配列
    description: string; // 記事の要約テキスト（GitHub Markdownとは別に表示される）
    likes: number;       // いいね数
    comment_cnt: number; // コメント数
    created_at: string;  // 作成日時
    updated_at: string;  // 更新日時
}
```

> **description と GitHub Markdown の関係**: `description` は記事の要約・説明文であり、ブログ詳細画面では `description` のテキストとGitHub URLから取得したMarkdownの両方が別々に描画される（`BlogPost.tsx:117-124`）。

### Comment

記事に対するコメント。

```typescript
// src/app/types/blogs.ts
interface Comment {
    id: string;          // コメントID（UUID）
    blog_id: string;     // 対象ブログID
    guest_user: string;  // ゲストユーザー名
    comment: string;     // コメント本文
    parent_id?: string;  // 親コメントID（型定義のみ、UIおよびAPI送信は未実装）
    created_at: string;  // 作成日時
}
```

> **parent_id について**: 型定義には存在するが、コメント作成時のAPI送信（`addComment.ts`）では `parent_id` を送信しておらず、コメント一覧表示（`CommentsListComp.tsx`）でもスレッド構造の描画は行っていない。フラットリスト表示のみ。

### BlogLike

いいね情報。訪問者ID（visit_id）で同一ユーザーの重複いいねを防止。

```typescript
// src/app/types/blogs.ts
interface BlogLike {
    id: string;          // いいねID（UUID）
    blog_id: string;     // 対象ブログID
    visit_id: string;    // 訪問者ID
    created_at: string;  // 作成日時
    updated_at: string;  // 更新日時
}
```

### User

認証ユーザー情報。

```typescript
// src/app/types/users.ts
interface User {
    id: string;          // ユーザーID（UUID）
    name: string;        // ユーザー名
    email: string;       // メールアドレス
    created_at: string;  // 作成日時
    updated_at: string;  // 更新日時
}
```

## 2. バリデーションスキーマ（Zod）

### ログインフォーム

```typescript
// src/app/schema/authSchema.ts
const loginSchema = z.object({
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});
```

| フィールド | 型 | バリデーション |
|-----------|-----|---------------|
| email | string | 有効なメールアドレス形式 |
| password | string | 最小6文字 |

### 新規登録フォーム

```typescript
// src/app/schema/authSchema.ts
const registerSchema = z.object({
    name: z.string().min(2, '名前は2文字以上必要です'),
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});
```

| フィールド | 型 | バリデーション |
|-----------|-----|---------------|
| name | string | 最小2文字 |
| email | string | 有効なメールアドレス形式 |
| password | string | 最小6文字 |

### ブログ作成フォーム

```typescript
// src/app/schema/blogSchema.ts
const blogCreateSchema = z.object({
    title: z.string().min(1, 'タイトルは1文字以上必要です').optional(),
    github_url: z.string().url('正しいURLを入力してください').optional(),
    category: z.string().min(1, 'カテゴリは1文字以上必要です').optional(),
    tags: z.string().min(1, 'タグは1文字以上必要です').optional(),
    description: z.string().min(1, '内容は1文字以上必要です').optional(),
});
```

| フィールド | 型 | バリデーション |
|-----------|-----|---------------|
| title | string? | 最小1文字 |
| github_url | string? | 有効なURL形式 |
| category | string? | 最小1文字 |
| tags | string? | 最小1文字（カンマ区切りテキスト） |
| description | string? | 最小1文字 |

### ブログ編集フォーム

ブログ作成フォームと同一スキーマ（`blogEditSchema`）。

### コメント投稿フォーム

```typescript
// src/app/schema/blogCommentSchema.ts
const blogCommentSchema = z.object({
    blog_id: z.string().min(1, 'ブログIDは1文字以上必要です').optional(),
    guest_user: z.string().min(1, 'ゲスト名は1文字以上必要です').optional(),
    comment: z.string().min(1, 'コメントは1文字以上必要です').optional(),
});
```

| フィールド | 型 | バリデーション |
|-----------|-----|---------------|
| blog_id | string? | 最小1文字 |
| guest_user | string? | 最小1文字 |
| comment | string? | 最小1文字 |

## 3. データ変換処理

### ブログ一覧取得時の変換（`fetchBlogs.ts`）

バックエンドAPIのレスポンスをフロントエンド型に変換:

| バックエンド | フロントエンド | 変換ロジック |
|-------------|--------------|-------------|
| `tags` (string) | `tags` (string[]) | カンマ区切り文字列を配列に分割 |
| `tags` (string[]) | `tags` (string[]) | そのまま使用 |
| `github_url` (null) | `github_url` ('')  | null → 空文字 |
| `likes` (null) | `likes` (0) | null → 0 |
| `comment_cnt` (null) | `comment_cnt` (0) | null → 0 |
| `created_at` (ISO 8601) | `created_at` ('yyyy/M/d') | `toLocaleDateString('ja-JP')` で変換（ゼロ埋めなし） |
| `updated_at` (ISO 8601) | `updated_at` ('yyyy/M/d') | `toLocaleDateString('ja-JP')` で変換（ゼロ埋めなし） |

### ブログ作成/更新時の変換

| フロントエンド | バックエンド | 変換ロジック |
|--------------|-------------|-------------|
| `github_url` | `githubUrl` | フィールド名をキャメルケースに変換 |

## 4. 状態管理

### React Context

| Context | 管理するデータ | 更新タイミング |
|---------|--------------|---------------|
| AuthContext | `user`, `isLoading` | ログイン/ログアウト/ページ読み込み時 |
| GlobalContext | `categories`, `tags`, `popularPosts` | ホーム画面のブログデータ取得後 |

### TanStack Query キャッシュキー

| キー | データ | 使用場所 |
|------|--------|---------|
| `['authUser']` | 認証ユーザー情報 | AuthContext |
| `['blogs', {filters}]` | ブログ一覧（フィルタ条件付き） | Home |
| `['blog', id]` | 個別ブログ | BlogPost, EditPost |
| `['comments', blogId]` | コメント一覧 | useComments |
| `['likedBlogs']` | いいね済みブログID配列 | useLikeBlog |

### Zustand Store（開発用サンプル）

以下のStoreは開発初期のサンプルデータ用であり、本番ではTanStack Query + API経由のデータ取得が使用される:

- `authStores.ts`: サンプル認証ストア
- `blogStores.ts`: サンプルブログストア（12件のサンプルデータ）
- `commentStores.ts`: サンプルコメントストア
