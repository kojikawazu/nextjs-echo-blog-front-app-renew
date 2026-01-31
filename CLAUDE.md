# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 14で構築されたMarkdownブログアプリのフロントエンド。バックエンドはEcho + Go（別リポジトリ）。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント・フォーマット
npm run lint
npm run format
npm run format:check

# E2Eテスト
npm run test:e2e              # HTMLレポート付き
npm run test:e2e:ui           # インタラクティブUI
npm run test:e2e:headed       # ブラウザ表示

# 特定テストのみ実行
npx playwright test e2e/tests/pages/blog_home/home.spec.ts
```

## 環境変数

```bash
NEXT_PUBLIC_BACKEND_API_URL=  # バックエンドAPI URL
NEXT_PUBLIC_VISIT_ID_KEY=     # 訪問者ID用キー
```

## アーキテクチャ

### 状態管理の使い分け

- **React Context** (`contexts/`): 認証状態、グローバルデータ（カテゴリ、タグ、人気記事）
- **TanStack Query**: サーバー状態（ブログ、コメント）のフェッチ・キャッシュ
- **Zustand** (`stores/`): ローカルUI状態

### データフロー

```
コンポーネント → カスタムフック → TanStack Query → API関数 (lib/api/) → バックエンドAPI
```

### ディレクトリ構成

- `src/app/(auth)/` - 認証ルート（login, register）
- `src/app/(common)/` - メインルート（blog, category, tag, new, edit）
- `src/app/components/` - Reactコンポーネント
- `src/app/lib/api/` - API通信関数
- `src/app/hooks/` - カスタムフック（useComments, useLikeBlog, useDebounce）
- `src/app/schema/` - Zodバリデーションスキーマ
- `src/app/types/` - TypeScript型定義
- `src/app/utils/const/constants.ts` - APIエンドポイント・定数

### Provider構成（layout.tsx）

```tsx
<QueryProvider>
  <AuthProvider>
    <GlobalProvider>
      <ToastProvider />
      {children}
    </GlobalProvider>
  </AuthProvider>
</QueryProvider>
```

## 主要な型

```typescript
// Blog
interface Blog {
  id: string;
  user_id: string;
  title: string;
  github_url?: string;
  category: string;
  tags: string[];
  description: string;  // Markdown
  likes: number;
  comment_cnt: number;
  created_at: string;
  updated_at: string;
}

// Comment（parent_idでリプライ対応）
interface Comment {
  id: string;
  blog_id: string;
  guest_user: string;
  comment: string;
  parent_id?: string;
  created_at: string;
}
```

## コード規約

- パスエイリアス: `@/*` で `./src/*` を参照
- Prettier設定: タブ幅4、シングルクォート、末尾カンマ
- 通知: react-hot-toastを使用

## デプロイ

mainブランチへのプッシュでGitHub Actionsが自動実行：
1. Playwright E2Eテスト
2. Dockerイメージビルド
3. Google Cloud Runへデプロイ
