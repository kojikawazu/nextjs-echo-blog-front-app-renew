---
description: Next.js (App Router) フロントエンド設計・コンポーネント規約
globs: "apps/front/src/app/components/**,apps/front/src/app/hooks/**,apps/front/src/app/lib/**,apps/front/src/app/contexts/**,apps/front/src/app/provider/**,apps/front/src/app/(auth)/**,apps/front/src/app/(common)/**"
---

# フロントエンドルール（Next.js App Router）

## コンポーネント設計

**機能別構成**を採用する（`components/{feature}/`）。ドメイン数が少ない小〜中規模のため、features/ 配下への分割は行わない。

- `components/{feature}/` — 機能単位（`auth/` `blogs/` `home/`）
- `components/{feature}/parts/` — その機能内で使う部品（`blogs/parts/BlogCard.tsx` 等）
- `components/common/` — 機能横断の汎用部品（`modal/` `pages/`）
- `components/layout/` — 共通レイアウト（Header / Sidebar / Footer）

## サーバー/クライアント分離

- **現状は全ページ CSR**（データ取得は TanStack Query によるクライアントフェッチ）。以下は**移行目標**であり、既存コードは即違反とはしない。SSR/SSG 化は `docs/11-tasks.md` の改善候補として管理する。
- **目標: server-first**。新規実装では、データ取得・SEO をサーバーコンポーネントで行えないかをまず検討する。
- `page.tsx`（Server Component）は**データ取得と合成の場**。「薄く」する必要はないが、**ビジネスロジックは置かない**（`lib/`・サーバー関数へ）。
- server/client 境界を明確にするためファイルを分離する:
  - `page.tsx` — サーバーコンポーネント（データ取得・SEO・props 受け渡し）
  - `client.tsx` — クライアントコンポーネント（インタラクション・状態管理）

## ロジック分離（hooks）

- **クライアントコンポーネント**のロジック（状態・副作用・データ取得・ドメイン処理）は**カスタムフック**（`hooks/`）に切り出す。コンポーネントは UI 描画に専念する。
- **サーバーコンポーネント**のデータ取得は `page.tsx` や `lib/` 内のサーバー関数で行う（hooks は使用しない）。
- **store（Zustand）・Context value・カスタムフックの戻り値は型を先に定義し、各メンバーにコメントを付ける**（`create<BlogState>()` のようにインラインのオブジェクトリテラルで済ませない）。これらは定義ファイルを開かずに使われるため、コメントが唯一の説明になる。詳細は `jsdoc.md`「状態・ロジック層のコメント」に従う。
- コンポーネント内に閉じた `useState`・ハンドラ関数は一律必須にしない（「なぜ」が非自明なときのみ）。

## 状態管理・Context

状態の種類で手段を分ける:

| 層 | 技術 | 用途 |
|----|------|------|
| サーバー状態 | TanStack Query | API データのフェッチ・キャッシュ・再検証（ブログ、コメント、いいね） |
| グローバル状態 | React Context (`contexts/`) | 認証状態、カテゴリ、タグ、人気記事 |
| ローカル UI 状態 | Zustand (`stores/`) / useState | フォーム値、モーダル開閉、フィルタ |

- **Context は cross-cutting かつ低頻度変更**の関心事に限定する: 認証/セッション、テーマ、i18n、feature flag、DI。
- 頻繁に変わる状態・サーバー状態を Context に載せない（再レンダリング多発）。→ TanStack Query / Zustand へ。
- Context は関心事ごとに分割し、provider の value は memo 化する。
- **Next.js 固有**: Context の provider は Client Component（`"use client"`）必須。Server Component は Context を参照できないため、provider は必要な client 境界に置き、ツリー全体を包まない。

## 型定義

- props・state・API レスポンス型は**原則 `type`** を使う（`typescript.md` の type/interface 方針に従う）。
- 置き場所は**参照範囲**で決める。1 ファイルに閉じる型（props 型等）はコロケーション、2 箇所以上から参照される型は `types/` へ集約する。詳細は `typescript.md`「型定義の配置」に従う。
- `type` / `interface` は型本体・各メンバーともにコメント必須（`jsdoc.md`）。
- **マジックナンバー・マジック文字列を直接書かない**（判断軸は型と同じ「参照範囲」）。ただし union の元になる定数は、導出される型と**同じファイルに同居**させる。環境変数は定数に含めない。詳細は `typescript.md`「定数の配置」に従う。

## ディレクトリ構成

本プロジェクトは App Router 配下（`src/app/`）に実装一式を集約する。

```
apps/front/src/app/
├── (auth)/                 # 認証ルートグループ（login, register）
├── (common)/               # メインルートグループ（/, blog, category, tag, new, edit）
├── api/                    # Route Handlers（BFF）→ api-bff.md の管轄
├── components/             # 機能別コンポーネント
│   ├── auth/  blogs/  home/  common/  layout/
├── contexts/               # React Context（AuthContext, GlobalContext）
├── hooks/                  # クライアントロジック（useXxx）
├── lib/api/                # API 通信関数
├── provider/               # QueryProvider / ToastProvider
├── schema/                 # Zod スキーマ
├── stores/                 # Zustand Store
├── types/                  # 型定義
└── utils/const/            # 定数（constants.ts）
```

## インポート

- `@/*` パスエイリアスを使用する（相対パスの深いネストを避ける）。`@/*` は `apps/front/src/*` を指す。

## 通知

- 通知は **react-hot-toast** を使用する。全操作の成功/失敗をトーストで通知する。
- トーストのメッセージ文言は**共通定数に集約**し、コンポーネントに直書きしない。現状の置き場は `utils/const/constants.ts`（`COMMON_CONSTANTS`）。ドメイン単位への分割は移行目標であり、`typescript.md`「定数の配置」に従う。

## テスト

- E2E: Playwright（`apps/front/e2e/`）
- Base URL: `http://localhost:3000`
