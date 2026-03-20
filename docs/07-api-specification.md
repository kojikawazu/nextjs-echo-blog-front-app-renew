# API仕様書（API Specification）

## 1. 概要

フロントエンドはNext.js Route Handlers（BFFプロキシ）を通じてバックエンドAPIにアクセスする。クライアントからはすべて `/api/*` パスへリクエストし、Route Handlerがバックエンドへ中継する。

```
クライアント → /api/* (Next.js Route Handler) → バックエンドAPI (Echo + Go)
```

### 共通仕様

- **認証**: Cookie認証（`credentials: 'include'`）
- **Content-Type**: `application/json`
- **Cookie転送**: リクエスト/レスポンスのCookieを双方向転送

## 2. 認証API

### POST `/api/auth/login`

ログイン処理。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/users/login` |
| ファイル | `src/app/api/auth/login/route.ts` |

**リクエスト**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**レスポンス**: バックエンドのレスポンスを透過（Set-Cookie付き）

---

### POST `/api/auth/logout`

ログアウト処理。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/users/logout` |
| ファイル | `src/app/api/auth/logout/route.ts` |

**リクエスト**: ボディなし（Cookieで認証）

---

### GET `/api/auth/check`

認証状態チェック。未認証の場合は200 + nullを返す（コンソールエラー抑止）。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/users/auth-check` |
| ファイル | `src/app/api/auth/check/route.ts` |

**レスポンス（認証済み）**
```json
{
    "user_id": "uuid",
    "username": "ユーザー名",
    "email": "user@example.com"
}
```

**レスポンス（未認証）**: `null`（ステータス200）

## 3. ブログAPI

### GET `/api/blogs`

ブログ一覧取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs` |
| ファイル | `src/app/api/blogs/route.ts` |

**レスポンス**: Blog配列

---

### POST `/api/blogs`

ブログ作成（認証必須）。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/create` |
| ファイル | `src/app/api/blogs/route.ts` |

**リクエスト**
```json
{
    "title": "記事タイトル",
    "description": "記事本文",
    "category": "カテゴリ名",
    "tags": "タグ1, タグ2",
    "githubUrl": "https://github.com/owner/repo/blob/main/article.md"
}
```

---

### GET `/api/blogs/[id]`

ブログ詳細取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/detail/{id}` |
| ファイル | `src/app/api/blogs/[id]/route.ts` |

**レスポンス**: Blog オブジェクト

---

### PUT `/api/blogs/[id]`

ブログ更新（認証必須、オーナーのみ）。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/update/{id}` |
| ファイル | `src/app/api/blogs/[id]/route.ts` |

**リクエスト**: POST `/api/blogs` と同一形式

---

### DELETE `/api/blogs/[id]`

ブログ削除（認証必須、オーナーのみ）。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/delete/{id}` |
| ファイル | `src/app/api/blogs/[id]/route.ts` |

**レスポンス**: 204 No Content（成功時）

---

### GET `/api/blogs/categories`

全カテゴリ一覧取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/categories` |
| ファイル | `src/app/api/blogs/categories/route.ts` |

**レスポンス**: `string[]`

---

### GET `/api/blogs/tags`

全タグ一覧取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/tags` |
| ファイル | `src/app/api/blogs/tags/route.ts` |

**レスポンス**: `string[]`

---

### GET `/api/blogs/popular/[count]`

人気記事取得（いいね数順）。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blogs/popular/{count}` |
| ファイル | `src/app/api/blogs/popular/[count]/route.ts` |

**パラメータ**: `count` — 取得件数（デフォルト5）

**レスポンス**: `{ id: string, title: string, likes: number }[]`

## 4. いいねAPI

### GET `/api/blog-likes`

いいね済みブログ一覧取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blog-likes` |
| ファイル | `src/app/api/blog-likes/route.ts` |

**バックエンドレスポンス**: `{ blog_id: string }[]`（BlogLikeオブジェクト配列）

**クライアント側変換**: `fetchLikedBlogs.ts` で `data.map(like => like.blog_id)` により `string[]` に変換

---

### GET `/api/blog-likes/generate-visit-id`

訪問者IDの生成。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blog-likes/generate-visit-id` |
| ファイル | `src/app/api/blog-likes/generate-visit-id/route.ts` |

**レスポンス**
```json
{
    "visitId": "生成された訪問者ID"
}
```

---

### POST `/api/blog-likes/[blogId]`

いいね登録。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blog-likes/create/{blogId}` |
| ファイル | `src/app/api/blog-likes/[blogId]/route.ts` |

---

### DELETE `/api/blog-likes/[blogId]`

いいね取り消し。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/blog-likes/delete/{blogId}` |
| ファイル | `src/app/api/blog-likes/[blogId]/route.ts` |

## 5. コメントAPI

### GET `/api/comments/[blogId]`

ブログのコメント一覧取得。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/comments/blog/{blogId}` |
| ファイル | `src/app/api/comments/[blogId]/route.ts` |

**レスポンス**: `Comment[]`

---

### POST `/api/comments`

コメント投稿。

| 項目 | 値 |
|------|-----|
| プロキシ先 | `/comments/create` |
| ファイル | `src/app/api/comments/route.ts` |

**リクエスト**（camelCase形式で送信）
```json
{
    "blogId": "ブログID",
    "guestUser": "ゲスト名",
    "comment": "コメント本文"
}
```

> **注意**: 型定義上は `parent_id` フィールドが存在するが、API送信時には含まれない（リプライ機能は未実装）。

## 6. GitHubプロキシAPI

### POST `/api/github/markdown`

GitHub上のMarkdownファイルを取得。Route Handler内で直接処理（`proxyToBackend` 不使用）。

| 項目 | 値 |
|------|-----|
| 処理方式 | 独自ロジック（GitHub API直接アクセス） |
| ファイル | `src/app/api/github/markdown/route.ts` |

**リクエスト**
```json
{
    "url": "https://github.com/owner/repo/blob/main/path/to/article.md"
}
```

**レスポンス（成功）**
```json
{
    "content": "Markdownの本文（フロントマター除去済み）"
}
```

**エラーレスポンス**

| ステータス | 条件 |
|-----------|------|
| 400 | 不正なJSON、urlフィールドなし、url非string、URL形式不正 |
| 403 | 許可外オーナーのリポジトリ |
| 500 | `ALLOWED_REPO_OWNER` 未設定（fail-closed） |
| その他 | GitHub APIからのエラーステータスを透過 |

## 7. Route Handler一覧

| エンドポイント | メソッド | プロキシ先 | 備考 |
|--------------|---------|-----------|------|
| `/api/auth/login` | POST | `/users/login` | Cookie転送 |
| `/api/auth/logout` | POST | `/users/logout` | Cookie転送 |
| `/api/auth/check` | GET | `/users/auth-check` | 未認証時200+null |
| `/api/blogs` | GET | `/blogs` | |
| `/api/blogs` | POST | `/blogs/create` | 認証必須 |
| `/api/blogs/[id]` | GET | `/blogs/detail/{id}` | |
| `/api/blogs/[id]` | PUT | `/blogs/update/{id}` | 認証必須 |
| `/api/blogs/[id]` | DELETE | `/blogs/delete/{id}` | 認証必須 |
| `/api/blogs/categories` | GET | `/blogs/categories` | |
| `/api/blogs/tags` | GET | `/blogs/tags` | |
| `/api/blogs/popular/[count]` | GET | `/blogs/popular/{count}` | |
| `/api/blog-likes` | GET | `/blog-likes` | |
| `/api/blog-likes/generate-visit-id` | GET | `/blog-likes/generate-visit-id` | |
| `/api/blog-likes/[blogId]` | POST | `/blog-likes/create/{blogId}` | |
| `/api/blog-likes/[blogId]` | DELETE | `/blog-likes/delete/{blogId}` | |
| `/api/comments` | POST | `/comments/create` | |
| `/api/comments/[blogId]` | GET | `/comments/blog/{blogId}` | |
| `/api/github/markdown` | POST | GitHub API直接 | 独自ロジック |

## 8. クライアントAPI関数一覧

| 関数 | ファイル | 呼び出し先 |
|------|---------|-----------|
| `fetchBlogs()` | `lib/api/fetchBlogs.ts` | GET `/api/blogs` |
| `fetchBlogById()` | `lib/api/fetchBlogById.ts` | GET `/api/blogs/:id` |
| `createBlog()` | `lib/api/createBlog.ts` | POST `/api/blogs` |
| `updateBlogById()` | `lib/api/updateBlogById.ts` | PUT `/api/blogs/:id` |
| `deleteBlogById()` | `lib/api/deleteBlogById.ts` | DELETE `/api/blogs/:id` |
| `fetchComments()` | `lib/api/blog-comments/fetchComments.ts` | GET `/api/comments/:blogId` |
| `addComment()` | `lib/api/blog-comments/addComment.ts` | POST `/api/comments` |
| `fetchLikedBlogs()` | `lib/api/blog-likes/fetchLikedBlogs.ts` | GET `/api/blog-likes` |
| `generateVisitId()` | `lib/api/blog-likes/generateVisitId.ts` | GET `/api/blog-likes/generate-visit-id` |
| `likeBlogById()` | `lib/api/blog-likes/likeBlogById.ts` | POST `/api/blog-likes/:blogId` |
| `unlikeBlogById()` | `lib/api/blog-likes/unLikeBlogById.ts` | DELETE `/api/blog-likes/:blogId` |
| `fetchMarkdown()` | `lib/api/github/fetchGitHub.ts` | POST `/api/github/markdown` |
