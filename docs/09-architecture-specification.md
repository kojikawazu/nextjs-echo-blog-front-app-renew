# アーキテクチャ仕様書（Architecture Specification）

## 目次

- [1. システムアーキテクチャ](#1-システムアーキテクチャ)
    - [全体構成](#全体構成)
    - [技術スタック](#技術スタック)
- [2. ディレクトリ構成](#2-ディレクトリ構成)
    - [`src/app/` 外のテスト関連ファイル](#srcapp-外のテスト関連ファイル)
- [3. Provider構成](#3-provider構成)
    - [Provider依存関係](#provider依存関係)
- [4. 状態管理アーキテクチャ](#4-状態管理アーキテクチャ)
    - [3層の状態管理](#3層の状態管理)
    - [データフロー](#データフロー)
- [5. ルーティング](#5-ルーティング)
    - [Route Groups](#route-groups)
    - [動的ルート](#動的ルート)
- [6. デプロイアーキテクチャ](#6-デプロイアーキテクチャ)
    - [Dockerマルチステージビルド](#dockerマルチステージビルド)
    - [CI/CDフロー](#cicdフロー)
    - [シークレットの注入経路](#シークレットの注入経路)
- [7. Next.js設定](#7-nextjs設定)

## 1. システムアーキテクチャ

### 全体構成

```
┌──────────┐    ┌──────────────┐    ┌─────────────────────────────┐    ┌──────────────────┐
│ ブラウザ  │───→│  Cloudflare  │───→│   Cloud Run (Next.js)       │───→│  Cloud Run (Echo) │
│          │←───│  (CDN/WAF)   │←───│   フロントエンド + BFFプロキシ│←───│  バックエンドAPI   │
└──────────┘    └──────────────┘    └──────────────┬──────────────┘    └────────┬─────────┘
                                                    │                           │
                                                    │ POST /api/github/markdown  │
                                                    ▼                           ▼
                                            ┌──────────────┐          ┌──────────────┐
                                            │  GitHub API   │          │  データベース   │
                                            └──────────────┘          └──────────────┘
```

### 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| フレームワーク | Next.js | 16.x |
| 言語 | TypeScript | 5.x |
| ランタイム | Node.js | 20.x |
| UI | React | 18.x |
| CSS | Tailwind CSS | 3.x |
| 状態管理（サーバー） | TanStack Query | 5.x |
| 状態管理（グローバル） | React Context | - |
| 状態管理（ローカル） | Zustand | 5.x |
| フォーム | React Hook Form | 7.x |
| バリデーション | Zod | 3.x |
| Markdown | react-markdown + remark-gfm + rehype-highlight | - |
| テスト | Playwright | 1.x |
| パッケージ管理 | pnpm | - |
| コンテナ | Docker (node:20 / node:20-alpine) | - |
| CDN/WAF | Cloudflare | - |
| ホスティング | Google Cloud Run | - |
| CI/CD | GitHub Actions | - |
| IaC | Terraform | - |
| シークレット | GCP Secret Manager | - |
| レジストリ | GCP Artifact Registry | - |

## 2. ディレクトリ構成

```
src/app/
├── (auth)/                     # 認証ルートグループ
│   ├── layout.tsx              # 認証レイアウト
│   ├── login/page.tsx          # ログインページ
│   └── register/page.tsx       # 新規登録ページ
├── (common)/                   # メインルートグループ
│   ├── layout.tsx              # 共通レイアウト（Header + Sidebar + Footer）
│   ├── page.tsx                # ホームページ（/）
│   ├── new/page.tsx            # 記事作成（/new）
│   ├── blog/[id]/page.tsx      # 記事詳細（/blog/:id）
│   ├── edit/[id]/page.tsx      # 記事編集（/edit/:id）
│   ├── category/[category]/page.tsx  # カテゴリ別（/category/:category）
│   └── tag/[tag]/page.tsx      # タグ別（/tag/:tag）
├── api/                        # Route Handlers（BFFプロキシ）
│   ├── _lib/proxy.ts           # プロキシヘルパー
│   ├── auth/                   # 認証エンドポイント
│   │   ├── check/route.ts
│   │   ├── login/route.ts
│   │   └── logout/route.ts
│   ├── blogs/                  # ブログエンドポイント
│   │   ├── route.ts            # GET(一覧), POST(作成)
│   │   ├── [id]/route.ts       # GET(詳細), PUT(更新), DELETE(削除)
│   │   ├── categories/route.ts
│   │   ├── tags/route.ts
│   │   └── popular/[count]/route.ts
│   ├── blog-likes/             # いいねエンドポイント
│   │   ├── route.ts
│   │   ├── generate-visit-id/route.ts
│   │   └── [blogId]/route.ts
│   ├── comments/               # コメントエンドポイント
│   │   ├── route.ts
│   │   └── [blogId]/route.ts
│   └── github/                 # GitHubプロキシ
│       └── markdown/route.ts
├── components/                 # UIコンポーネント
│   ├── auth/
│   │   ├── login/Login.tsx
│   │   └── register/Register.tsx
│   ├── blogs/
│   │   ├── BlogPost.tsx        # 記事詳細表示
│   │   ├── EditPost.tsx        # 記事編集フォーム
│   │   ├── NewPost.tsx         # 記事作成フォーム
│   │   └── parts/
│   │       ├── BlogCard.tsx    # 記事カード
│   │       ├── BlogFilter.tsx  # 検索・フィルタUI
│   │       ├── CommentsSection.tsx  # コメントセクション
│   │       └── CommentsListComp.tsx # コメント一覧
│   ├── common/
│   │   ├── modal/ConfirmModal.tsx   # 確認モーダル
│   │   └── pages/Pagination.tsx     # ページネーション
│   ├── home/Home.tsx           # ホームコンポーネント
│   └── layout/
│       ├── Header.tsx          # ヘッダー
│       ├── Sidebar.tsx         # サイドバー
│       └── Footer.tsx          # フッター
├── contexts/                   # React Context
│   ├── AuthContext.tsx          # 認証コンテキスト
│   └── GlobalContext.tsx        # グローバルデータコンテキスト
├── hooks/                      # カスタムフック
│   ├── __tests__/              # フックのユニットテスト（Vitest）
│   │   ├── useComments.test.ts
│   │   ├── useDebounce.test.ts
│   │   └── useLikeBlog.test.ts
│   ├── useComments.ts          # コメント機能
│   ├── useDebounce.ts          # デバウンスユーティリティ
│   └── useLikeBlog.ts          # いいね機能
├── lib/api/                    # API通信関数
│   ├── fetchBlogs.ts           # ブログ一覧取得
│   ├── fetchBlogById.ts        # ブログ詳細取得
│   ├── createBlog.ts           # ブログ作成
│   ├── updateBlogById.ts       # ブログ更新
│   ├── deleteBlogById.ts       # ブログ削除
│   ├── blog-comments/
│   │   ├── fetchComments.ts    # コメント取得
│   │   └── addComment.ts       # コメント追加
│   ├── blog-likes/
│   │   ├── fetchLikedBlogs.ts  # いいね済み取得
│   │   ├── generateVisitId.ts  # 訪問者ID生成
│   │   ├── likeBlogById.ts     # いいね登録
│   │   └── unLikeBlogById.ts   # いいね取消
│   └── github/
│       └── fetchGitHub.ts      # GitHub Markdown取得
├── provider/                   # Provider コンポーネント
│   ├── QueryProvider.tsx       # TanStack Query Provider
│   └── ToastProvider.tsx       # react-hot-toast Provider
├── schema/                     # Zodスキーマ
│   ├── __tests__/              # スキーマのユニットテスト（Vitest）
│   │   ├── authSchema.test.ts
│   │   ├── blogSchema.test.ts
│   │   └── blogCommentSchema.test.ts
│   ├── authSchema.ts           # 認証フォーム
│   ├── blogSchema.ts           # ブログフォーム
│   └── blogCommentSchema.ts    # コメントフォーム
├── stores/                     # Zustand Store（開発用サンプル）
│   ├── authStores.ts
│   ├── blogStores.ts
│   └── commentStores.ts
├── styles/
│   └── markdown.css            # Markdownスタイル
├── types/                      # TypeScript型定義
│   ├── blogs.ts                # Blog, Comment, BlogLike
│   └── users.ts                # User
├── utils/const/
│   └── constants.ts            # URL、メッセージ、設定値の定数
├── globals.css                 # グローバルCSS
└── layout.tsx                  # ルートレイアウト
```

### `src/app/` 外のテスト関連ファイル

| パス | 用途 |
|------|------|
| `vitest.config.ts`（リポジトリ直下） | Vitest 設定（jsdom 環境・setup ファイル指定・パスエイリアス） |
| `src/test/setup.ts` | Vitest のグローバルセットアップ（`@testing-library/jest-dom` 等） |
| `e2e/`（リポジトリ直下） | Playwright E2E テスト・モック（詳細は `docs/08-test-specification.md`） |

## 3. Provider構成

```tsx
// src/app/layout.tsx
<html lang="ja">
  <body>
    <QueryProvider>          // TanStack Query（サーバー状態キャッシュ）
      <AuthProvider>         // 認証状態（user, signIn, signOut）
        <GlobalProvider>     // グローバルデータ（categories, tags, popularPosts）
          <ToastProvider />  // 通知（react-hot-toast）
          {children}
        </GlobalProvider>
      </AuthProvider>
    </QueryProvider>
  </body>
</html>
```

### Provider依存関係

```
QueryProvider（TanStack Query）
  └── AuthProvider（useQuery, useMutationを使用）
        └── GlobalProvider（AuthProviderに依存しないが階層に含まれる）
              └── ToastProvider + ページコンポーネント
```

## 4. 状態管理アーキテクチャ

### 3層の状態管理

| 層 | 技術 | 用途 | 例 |
|----|------|------|-----|
| サーバー状態 | TanStack Query | APIデータのフェッチ・キャッシュ・再検証 | ブログ一覧、コメント、いいね |
| グローバル状態 | React Context | アプリ全体で共有するデータ | 認証状態、カテゴリ、タグ |
| ローカルUI状態 | Zustand / useState | コンポーネントローカルの状態 | フォーム値、モーダル開閉、フィルタ |

### データフロー

```
コンポーネント → カスタムフック → TanStack Query → API関数 (lib/api/) → /api/* Route Handler → バックエンドAPI
     ↑                                    ↓
     └──── キャッシュ無効化 ←── mutation成功
```

## 5. ルーティング

### Route Groups

| グループ | パス | レイアウト | 説明 |
|---------|------|----------|------|
| `(auth)` | `/login`, `/register` | 認証レイアウト（Header/Sidebar/Footerなし） |
| `(common)` | `/`, `/blog/*`, `/new`, `/edit/*`, `/category/*`, `/tag/*` | 共通レイアウト（Header + Sidebar + Footer） |

### 動的ルート

Next.js 16ではparamsがPromiseに変更:

```typescript
// ページコンポーネント
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <Component id={id} />;
}

// Route Handler
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `/path/${id}`);
}
```

## 6. デプロイアーキテクチャ

### Dockerマルチステージビルド

```
Stage 1: builder (node:20)
  → pnpm install --frozen-lockfile → pnpm build → .next/

Stage 2: runner (node:20-alpine)
  → package.json, .next/, node_modules/, public/, .env
  → PORT=8080 → node_modules/.bin/next start
```

### CI/CDフロー

```
main へ push
  → GitHub Actions
    ├── test.yml: E2Eテスト実行
    └── deploy_to_googlecloud.yml:
         1. .env に NEXT_PUBLIC_VISIT_ID_KEY のみ書出
         2. Dockerイメージビルド
         3. Artifact Registry へプッシュ
         4. Cloud Run へデプロイ
```

### シークレットの注入経路

```
GCP Secret Manager
  ├── backend-api-url     → Cloud Run env: BACKEND_API_URL
  ├── allowed-repo-owner  → Cloud Run env: ALLOWED_REPO_OWNER
  └── github-token        → Cloud Run env: GITHUB_TOKEN

.env (ビルド時)
  └── NEXT_PUBLIC_VISIT_ID_KEY → JSバンドルにインライン化
```

## 7. Next.js設定

```javascript
// next.config.mjs
const nextConfig = {
  images: { unoptimized: true },  // CDN側で最適化
  reactStrictMode: true,
};
```
