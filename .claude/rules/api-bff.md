---
description: Next.js BFF（Route Handlers）設計・API ルール
globs: "apps/front/src/app/api/**"
---

# API ルール（Next.js BFF / Route Handlers）

## 設計方針

- Next.js App Router の Route Handlers を BFF（Backend for Frontend）として使用する。
- BFF 層はフロントエンドとバックエンド（Echo + Go・別リポジトリ）の橋渡しに徹する。薄く保つ。
- バックエンド API の呼び出し・レスポンス整形・Cookie 転送を担当する。
- **バックエンド URL の秘匿が BFF の存在理由**: `BACKEND_API_URL` はサーバーサイド専用の環境変数とし、`NEXT_PUBLIC_` を付けない（付けるとビルド時に JS バンドルへインライン化され、クライアントから読める）。クライアントは必ず `/api/*` 経由でアクセスする。

## ディレクトリ構成

```
apps/front/src/app/api/
├── _lib/proxy.ts      # プロキシヘルパー（proxyToBackend）
├── auth/              # 認証（login, logout, check）
├── blogs/             # ブログ（一覧・詳細・categories・tags・popular）
├── blog-likes/        # いいね
├── comments/          # コメント
└── github/markdown/   # GitHub プロキシ（独自ロジック）
```

## 共通方針

- RESTful 設計（リソース指向エンドポイント）
- レスポンス形式: JSON（`NextResponse.json()`）
- プロキシ処理は `_lib/proxy.ts` の `proxyToBackend()` に集約し、Route Handler 自体は薄く保つ
- 入力バリデーションは Route Handler 内で実施（Zod 等）
- エラー時は適切な HTTP ステータスコード（400/401/403/404/500）で返す
- **動的ルートの params は Promise**（Next.js 16）:

```typescript
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyToBackend(req, `/blogs/detail/${id}`);
}
```

## 外部 API プロキシの fail-closed

`/api/github/markdown` のように、トークンを持って外部 API を叩くエンドポイントは**踏み台化を防ぐ**:

- アクセス先を**ホワイトリストで制限**する（`ALLOWED_REPO_OWNER`）。許可外は 403。
- URL 形式を正規表現で検証し、想定形式のみ通す。
- **fail-closed**: トークンがあるのにホワイトリスト設定が欠けている場合は、通さず 500 で拒否する（設定漏れが「全許可」に倒れないようにする）。
