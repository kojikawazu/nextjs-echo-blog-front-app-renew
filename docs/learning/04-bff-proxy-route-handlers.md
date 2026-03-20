# BFFプロキシ（Route Handlers）理解向上レポート

## 1. BFF（Backend For Frontend）とは

BFF は、フロントエンド専用のバックエンドレイヤーを設けるアーキテクチャパターン。クライアントとバックエンドAPIの間にプロキシを挟むことで、セキュリティ・データ変換・API集約などを実現する。

### BFFを使わない場合の問題

```
ブラウザ → 直接 fetch('https://backend-api.example.com/blogs')
                    ↑
        DevTools の Network タブで丸見え:
        - バックエンドAPI URL
        - リクエストヘッダー
        - リクエストボディ
        - 認証トークン
```

### BFFを使う場合

```
ブラウザ → fetch('/api/blogs')     ← 自ドメイン宛（URL非公開）
              ↓
        Next.js Route Handler      ← サーバーサイドで処理
              ↓
        fetch(BACKEND_API_URL)     ← 環境変数（クライアント非公開）
              ↓
        バックエンドAPI
```

**クライアントからは `/api/blogs` というパスしか見えない**。バックエンドのURLは `BACKEND_API_URL` 環境変数としてサーバーサイドのみに存在する。

---

## 2. Next.js Route Handlers とは

Next.js App Router の Route Handlers は、`route.ts` ファイルで定義するサーバーサイドのHTTPエンドポイント。ページコンポーネント（`page.tsx`）とは異なり、HTMLではなくJSONなどのデータを返す。

### 基本的な構造

```typescript
// src/app/api/example/route.ts

import { NextRequest, NextResponse } from 'next/server';

// GET /api/example
export async function GET(req: NextRequest) {
    return NextResponse.json({ message: 'Hello' });
}

// POST /api/example
export async function POST(req: NextRequest) {
    const body = await req.json();
    return NextResponse.json({ received: body });
}
```

### ファイルパスとURLの対応

```
ファイル                                    → URL
src/app/api/blogs/route.ts                 → /api/blogs
src/app/api/blogs/[id]/route.ts            → /api/blogs/:id
src/app/api/blogs/popular/[count]/route.ts → /api/blogs/popular/:count
```

---

## 3. 本プロジェクトのプロキシ実装

### 3.1 プロキシヘルパー関数

**ファイル**: `src/app/api/_lib/proxy.ts`

本プロジェクトのBFFプロキシの中核。全Route Handlerから共通で呼び出される。

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function proxyToBackend(req: NextRequest, path: string) {
    // 1. 環境変数からバックエンドURLを取得（関数内で読み取り）
    const BACKEND_API_URL = process.env.BACKEND_API_URL;
    if (!BACKEND_API_URL) {
        return NextResponse.json(
            { error: 'BACKEND_API_URL is not configured' },
            { status: 500 }
        );
    }

    // 2. リクエストのCookieを取得
    const cookieHeader = req.headers.get('cookie') || '';

    // 3. リクエストボディの取得（GET/HEAD以外）
    let body: string | undefined;
    const method = req.method.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
        try {
            const json = await req.json();
            body = JSON.stringify(json);
        } catch {
            // ボディなしリクエストの場合はスキップ
        }
    }

    // 4. バックエンドへリクエスト転送
    const backendResponse = await fetch(`${BACKEND_API_URL}${path}`, {
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,        // Cookie転送（クライアント → バックエンド）
        },
        body,
    });

    // 5. 204 No Content の処理
    if (backendResponse.status === 204) {
        const res = new NextResponse(null, { status: 204 });
        const setCookie = backendResponse.headers.get('set-cookie');
        if (setCookie) res.headers.set('set-cookie', setCookie);
        return res;
    }

    // 6. レスポンスボディの取得
    let data;
    try {
        data = await backendResponse.json();
    } catch {
        data = await backendResponse.text();
    }

    // 7. レスポンス返却（Set-Cookie転送）
    const res = NextResponse.json(data, { status: backendResponse.status });
    const setCookie = backendResponse.headers.get('set-cookie');
    if (setCookie) {
        res.headers.set('set-cookie', setCookie);  // Cookie転送（バックエンド → クライアント）
    }
    return res;
}
```

### Cookie 双方向転送の仕組み

```
┌──────────┐    Cookie ヘッダー     ┌──────────────────┐    Cookie ヘッダー     ┌─────────────┐
│ ブラウザ  │ ──────────────────→ │  Route Handler    │ ──────────────────→ │ バックエンドAPI │
│          │                     │  (proxy.ts)       │                     │             │
│          │ ←────────────────── │                   │ ←────────────────── │             │
│          │    Set-Cookie        │                   │    Set-Cookie        │             │
└──────────┘                     └──────────────────┘                     └─────────────┘
```

1. **リクエスト時**: ブラウザが送信した `Cookie` ヘッダーを抽出し、バックエンドへの `fetch` に転送
2. **レスポンス時**: バックエンドが返した `Set-Cookie` ヘッダーをブラウザへのレスポンスに転送

これにより、**認証Cookie（HttpOnly）がRoute Handlerを経由してバックエンドと透過的にやり取り**される。

### Next.js 16 対応のポイント

```typescript
// ⚠️ Next.js 16 では環境変数をファイルスコープで読むとビルド時に固定される
// ❌ const BACKEND_API_URL = process.env.BACKEND_API_URL; // ファイルスコープ

// ✅ 関数内で読み取ることでランタイムに毎回取得
export async function proxyToBackend(req: NextRequest, path: string) {
    const BACKEND_API_URL = process.env.BACKEND_API_URL; // 関数スコープ
    // ...
}
```

---

### 3.2 Route Handler 一覧

#### 認証エンドポイント

| ファイル | メソッド | クライアントURL | プロキシ先 |
|---------|---------|---------------|-----------|
| `api/auth/login/route.ts` | POST | `/api/auth/login` | `/users/login` |
| `api/auth/logout/route.ts` | POST | `/api/auth/logout` | `/users/logout` |
| `api/auth/check/route.ts` | GET | `/api/auth/check` | `/users/auth-check` |

**認証チェックの特殊処理**:

```typescript
// api/auth/check/route.ts
export async function GET(req: NextRequest) {
    try {
        return await proxyToBackend(req, '/users/auth-check');
    } catch {
        // 未認証時は 200 + null を返す（ブラウザコンソールのエラーを抑止）
        return NextResponse.json(null);
    }
}
```

#### ブログエンドポイント

| ファイル | メソッド | クライアントURL | プロキシ先 |
|---------|---------|---------------|-----------|
| `api/blogs/route.ts` | GET | `/api/blogs` | `/blogs` |
| `api/blogs/route.ts` | POST | `/api/blogs` | `/blogs/create` |
| `api/blogs/[id]/route.ts` | GET | `/api/blogs/:id` | `/blogs/detail/:id` |
| `api/blogs/[id]/route.ts` | PUT | `/api/blogs/:id` | `/blogs/update/:id` |
| `api/blogs/[id]/route.ts` | DELETE | `/api/blogs/:id` | `/blogs/delete/:id` |
| `api/blogs/categories/route.ts` | GET | `/api/blogs/categories` | `/blogs/categories` |
| `api/blogs/tags/route.ts` | GET | `/api/blogs/tags` | `/blogs/tags` |
| `api/blogs/popular/[count]/route.ts` | GET | `/api/blogs/popular/:count` | `/blogs/popular/:count` |

#### いいねエンドポイント

| ファイル | メソッド | クライアントURL | プロキシ先 |
|---------|---------|---------------|-----------|
| `api/blog-likes/route.ts` | GET | `/api/blog-likes` | `/blog-likes` |
| `api/blog-likes/generate-visit-id/route.ts` | GET | `/api/blog-likes/generate-visit-id` | `/blog-likes/generate-visit-id` |
| `api/blog-likes/[blogId]/route.ts` | POST | `/api/blog-likes/:blogId` | `/blog-likes/create/:blogId` |
| `api/blog-likes/[blogId]/route.ts` | DELETE | `/api/blog-likes/:blogId` | `/blog-likes/delete/:blogId` |

#### コメントエンドポイント

| ファイル | メソッド | クライアントURL | プロキシ先 |
|---------|---------|---------------|-----------|
| `api/comments/route.ts` | POST | `/api/comments` | `/comments/create` |
| `api/comments/[blogId]/route.ts` | GET | `/api/comments/:blogId` | `/comments/blog/:blogId` |

---

### 3.3 GitHub Markdown プロキシ（独自ロジック）

**ファイル**: `src/app/api/github/markdown/route.ts`

このエンドポイントは `proxyToBackend` を使わず、GitHub APIに直接アクセスする独自ロジック。

```
ブラウザ → POST /api/github/markdown → Route Handler → GitHub API → Markdown返却
```

#### セキュリティ対策の全体像

```typescript
export async function POST(req: NextRequest) {
    // 1. リクエストボディの検証
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { url } = body;
    if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 2. URL形式の検証（正規表現）
    const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/main\/(.+\.md)$/;
    const match = url.match(regex);
    if (!match) {
        return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }
    const [, owner, repo, path] = match;

    // 3. 環境変数の取得
    const githubToken = process.env.GITHUB_TOKEN;
    const ALLOWED_OWNER = (process.env.ALLOWED_REPO_OWNER || '').trim();

    // 4. Fail-closed 設計
    if (githubToken && !ALLOWED_OWNER) {
        // トークンはあるのにオーナー制限が未設定 → 安全側に倒す
        return NextResponse.json(
            { error: 'ALLOWED_REPO_OWNER is not configured' },
            { status: 500 }
        );
    }

    // 5. オーナーホワイトリスト検証
    if (ALLOWED_OWNER && owner !== ALLOWED_OWNER) {
        return NextResponse.json(
            { error: 'Repository owner not allowed' },
            { status: 403 }
        );
    }

    // 6. GitHub API リクエスト
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3.raw',
    };
    if (githubToken && ALLOWED_OWNER && owner === ALLOWED_OWNER) {
        headers['Authorization'] = `Bearer ${githubToken}`;
    }

    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
        return NextResponse.json(
            { error: 'Failed to fetch markdown' },
            { status: response.status }
        );
    }

    // 7. フロントマター除去
    const rawContent = await response.text();
    const { content } = matter(rawContent);    // gray-matter で YAML メタデータを除去

    return NextResponse.json({ content });
}
```

#### セキュリティ対策の層

| 層 | 対策 | 目的 |
|----|------|------|
| 入力検証 | JSON形式、urlフィールド、string型チェック | 不正リクエスト拒否 |
| URL検証 | 正規表現で GitHub Markdown URL のみ許可 | 任意URL アクセス防止 |
| Fail-closed | トークン有り + オーナー未設定 → 500 | 設定漏れ時の保護 |
| オーナー制限 | `ALLOWED_REPO_OWNER` でホワイトリスト | プライベートリポジトリ漏洩防止 |
| トークン制御 | 許可オーナー以外はトークン不使用 | トークン悪用防止 |

---

## 4. クライアントサイドAPI関数

### 4.1 URL定数の管理

**ファイル**: `src/app/utils/const/constants.ts`

```typescript
export const COMMON_CONSTANTS = {
    URL: {
        // 認証
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        AUTH_CHECK: '/api/auth/check',

        // ブログ
        BLOGS: '/api/blogs',
        BLOG_CREATE: '/api/blogs',
        BLOG_DETAIL: '/api/blogs/:id',
        BLOG_UPDATE: '/api/blogs/:id',
        BLOG_DELETE: '/api/blogs/:id',
        BLOG_CATEGORIES: '/api/blogs/categories',
        BLOG_TAGS: '/api/blogs/tags',
        BLOG_POPULAR: '/api/blogs/popular/:count',

        // いいね
        BLOG_LIKES: '/api/blog-likes',
        BLOG_LIKE: '/api/blog-likes/:blogId',
        BLOG_UNLIKE: '/api/blog-likes/:blogId',
        GENERATE_VISIT_ID: '/api/blog-likes/generate-visit-id',

        // コメント
        COMMENTS: '/api/comments/:blogId',
        COMMENT_CREATE: '/api/comments',

        // GitHub
        GITHUB_MARKDOWN: '/api/github/markdown',
    },
    // ...
};
```

全URLが `/api/*` で始まり、バックエンドURLは一切含まれていない。

### 4.2 API関数のパターン

**ファイル**: `src/app/lib/api/fetchBlogs.ts`（読み取り例）

```typescript
export async function fetchBlogs(...) {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOGS, {
        credentials: 'include',    // Cookie を含める
    });
    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_HOME.TOAST_FETCH_BLOG_ERROR);
    }
    const data = await response.json();
    // データ変換処理...
    return data;
}
```

**ファイル**: `src/app/lib/api/createBlog.ts`（書き込み例）

```typescript
export async function createBlog(createdData: BlogCreateFormValues) {
    const response = await fetch(COMMON_CONSTANTS.URL.BLOG_CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            title: createdData.title,
            description: createdData.description,
            category: createdData.category,
            tags: createdData.tags,
            githubUrl: createdData.github_url,  // snake_case → camelCase 変換
        }),
    });
    if (!response.ok) {
        throw new Error(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR);
    }
    return response.json();
}
```

**共通パターン**:
1. `COMMON_CONSTANTS.URL.*` でURLを取得
2. `credentials: 'include'` でCookieを含める
3. エラー時は `throw new Error` でTanStack Queryの `onError` に伝播
4. フィールド名のsnake_case → camelCase変換（バックエンドGo側の慣習に合わせる）

---

## 5. 全体アーキテクチャ図

```
┌──────────────────────────────────────────────────────────┐
│ ブラウザ（クライアントサイド）                              │
│                                                          │
│  コンポーネント (Home.tsx, BlogPost.tsx, ...)              │
│      ↓                                                   │
│  カスタムフック / TanStack Query                           │
│      ↓                                                   │
│  API関数 (lib/api/fetchBlogs.ts, createBlog.ts, ...)      │
│      ↓ fetch('/api/*', { credentials: 'include' })        │
│      ↓ Cookie ヘッダー付き                                │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│ Next.js サーバーサイド（Route Handlers）                    │
│                                                          │
│  api/_lib/proxy.ts  ← 共通プロキシヘルパー                 │
│      ↓                                                   │
│  環境変数: BACKEND_API_URL（サーバーサイド専用）             │
│      ↓                                                   │
│  fetch(`${BACKEND_API_URL}/path`, { Cookie 転送 })        │
│                                                          │
│  api/github/markdown/route.ts  ← 独自ロジック              │
│      ↓                                                   │
│  環境変数: GITHUB_TOKEN, ALLOWED_REPO_OWNER               │
│      ↓                                                   │
│  fetch('https://api.github.com/...', { Authorization })   │
└──────┬───────────────────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────────────────┐
│ バックエンドAPI（Echo + Go）/ GitHub API                    │
│                                                          │
│  - 認証: Cookie ベースのセッション管理                      │
│  - ブログ CRUD                                            │
│  - いいね / コメント管理                                    │
│  - 訪問者ID生成                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 6. セキュリティ上の効果

### BFF導入前後の比較

| 項目 | 導入前 | 導入後 |
|------|--------|--------|
| バックエンドURL | ブラウザから見える | サーバーサイドのみ |
| APIエンドポイント | 全パス丸見え | `/api/*` のみ見える |
| GITHUB_TOKEN | クライアントに露出リスク | サーバーサイドのみ |
| 環境変数プレフィックス | `NEXT_PUBLIC_BACKEND_API_URL` | `BACKEND_API_URL` |
| シークレット管理 | `.env` に直書き | GCP Secret Manager |

### 本プロジェクト固有のセキュリティ設計

1. **Fail-closed**: 設定漏れ時はアクセスを拒否する安全側の設計
2. **オーナーホワイトリスト**: GitHub APIトークンの悪用を防止
3. **Secret Manager**: Dockerイメージにシークレットを含めず、ランタイムで注入
4. **Cookie転送**: HttpOnly Cookieを透過的に中継し、認証を維持

---

## 7. 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/app/api/_lib/proxy.ts` | プロキシヘルパー（Cookie双方向転送） |
| `src/app/api/auth/login/route.ts` | ログインプロキシ |
| `src/app/api/auth/logout/route.ts` | ログアウトプロキシ |
| `src/app/api/auth/check/route.ts` | 認証チェックプロキシ |
| `src/app/api/blogs/route.ts` | ブログ一覧/作成プロキシ |
| `src/app/api/blogs/[id]/route.ts` | ブログ詳細/更新/削除プロキシ |
| `src/app/api/blogs/categories/route.ts` | カテゴリ一覧プロキシ |
| `src/app/api/blogs/tags/route.ts` | タグ一覧プロキシ |
| `src/app/api/blogs/popular/[count]/route.ts` | 人気記事プロキシ |
| `src/app/api/blog-likes/route.ts` | いいね一覧プロキシ |
| `src/app/api/blog-likes/[blogId]/route.ts` | いいね登録/取消プロキシ |
| `src/app/api/blog-likes/generate-visit-id/route.ts` | 訪問者ID生成プロキシ |
| `src/app/api/comments/route.ts` | コメント作成プロキシ |
| `src/app/api/comments/[blogId]/route.ts` | コメント一覧プロキシ |
| `src/app/api/github/markdown/route.ts` | GitHub Markdownプロキシ（独自ロジック） |
| `src/app/utils/const/constants.ts` | URL定数管理 |
| `src/app/lib/api/*.ts` | クライアントAPI関数群 |
