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

## 関心別にディレクトリを切る

`types/` `constants/` `schemas/` `repositories/` は**それぞれ独立したディレクトリ**として置く（本プロジェクトでは `src/app/` 直下）。いずれも**単一ファイルにまとめない**（`utils/const/constants.ts` のように 1 ファイルへ詰め込む形にしない。ドメイン単位でファイルを分ける）。詳細は `typescript.md`「型定義の配置」「定数の配置」「スキーマの配置」に従う。

| ディレクトリ | 置くもの | 置かないもの |
|---|---|---|
| `types/` | 2 箇所以上から参照される型 | 値・ロジック |
| `constants/` | 全環境で不変な値 | 環境変数・型を導出する定数（`types/` 側へ） |
| `schemas/` | Zod スキーマ（フォーム・API レスポンスの検証） | 検証を伴わない型定義（`types/` へ） |
| `repositories/` | **API アクセス**（`fetch` / BFF 呼び出し） | UI・画面都合の整形・業務判断 |
| `lib/` | **通信を持たない純粋ユーティリティ**（日付整形・計算等） | API アクセス（`repositories/` へ）・定数・型 |

- **`fetch` を書いてよいのは API アクセス層だけ**。コンポーネント・hooks・`lib/` の純粋関数から直接叩かない。呼び出し口を 1 箇所に閉じることで、Cookie 転送・エラー処理・リトライの実装が散らばらない。
- ディレクトリ名は**複数形で統一**する（`types` / `constants` / `schemas` / `repositories`）。

> **現状**: 本プロジェクトの API アクセス層は `lib/api/`（`fetchBlogs.ts` 等）、スキーマは単数形 `schema/`、定数は `utils/const/constants.ts` の 1 ファイルに置かれている。既存コードは即違反としない。`repositories/` への切り出し・`schemas/` への改名・`constants/` のドメイン分割は `docs/11-tasks.md` の改善候補として管理し、**新規追加分から上表に従う**。なお `lib/api/` を維持する間も、「`fetch` は API アクセス層のみ」「`lib/` の他のファイルは通信しない」は**新規追加分では現時点から守る**。
>
> なお `contexts/AuthContext.tsx`（認証チェック・ログイン・ログアウト）と `contexts/GlobalContext.tsx`（カテゴリ・タグ・人気記事）の直接 `fetch` は #129 で `lib/api/auth/` `lib/api/` へ切り出し済み。`contexts/` から `fetch` を直接呼ばない。

## レイヤ依存の一方向ルール

**依存は上位から下位への一方向のみ**。下位レイヤが上位レイヤを import してはならない。

```
app  →  components  →  hooks  →  lib/api  →  lib/ ・ schema/  →  types/ ・ utils/const/
（ルーティング・合成）（表示） （ロジック）（API アクセス）（純粋関数・検証）      （最下層）
```

| レイヤ | import してよい | import 禁止 |
|---|---|---|
| `(auth)/` `(common)/` | `components/`, `hooks/`, `contexts/`, `stores/`, `provider/`, `lib/`, `schema/`, `types/`, `utils/` | （なし。ルートセグメントは誰からも参照されない） |
| `components/` | 下位の `components/`, `hooks/`, `contexts/`, `lib/`（純粋関数）, `types/`, `utils/` | **ルートセグメント**（ページ固有の型・定数を含む）, **`lib/api/`**（データ取得は `hooks/` 経由） |
| `hooks/` | `lib/api/`, `lib/`, `stores/`, `contexts/`, `schema/`, `types/`, `utils/` | **ルートセグメント**, **`components/`**（JSX を返さない） |
| `lib/api/` | `lib/`, `schema/`, `types/`, `utils/` | **ルートセグメント**, **`components/`**, **`hooks/`**, **`stores/`** |
| `lib/`（純粋関数） `schema/` | `types/`, `utils/const/` | 上位レイヤすべて（`lib/` の純粋関数は通信もしない） |
| `types/` `utils/const/` | （原則どこにも依存しない） | 上位レイヤすべて |

- **`components/` 内も一方向**にする。`common/` の汎用部品は `{feature}/`（`blogs/` `auth/` `home/`）を import しない。`{feature}/parts/` は同じ機能の親を import しない。汎用度の高いものほど下位。
- **`app/api/`（BFF）から `components/` や `hooks/` を import しない**。BFF はサーバー側の層であり、UI 層に依存してはならない（`api-bff.md` 参照）。
- **サーバー専用モジュール（`process.env.BACKEND_API_URL` を読む処理等）を Client Component から import しない**。バックエンド URL の秘匿という BFF の存在理由が壊れる（`api-bff.md`）。
- **`hooks/` は JSX を返さない**。返したくなったらそれはコンポーネントであり、`components/` に置く。

禁止例:

- `components/blogs/parts/BlogCard.tsx` が `(common)/blog/[id]/page.tsx` の型・定数を import する
- `hooks/useBlogPost.ts` が `components/` を import する
- 同一レイヤ間の**相互依存（循環）**（例: `A.tsx` ⇄ `B.tsx` が互いを import）

### 逆流したくなったら「共通化」で解決する

| 逆流したい理由 | 正しい解き方 |
|---|---|
| 上位の型・定数を下位でも使いたい | その型・定数を**`types/` `utils/const/` へ移動**し、上下双方がそこを参照する |
| 上位のロジックを下位でも使いたい | 共通処理を**下位の `hooks/` または `lib/` の純粋関数へ抽出**し、双方から呼ぶ |
| 下位から上位の状態を変えたい | **呼ばない**。**props でコールバックを受け取る**（イベントは上へ、データは下へ）。階層が深いなら `stores/` `contexts/` を使う |
| 子が親のレイアウトを知りたい | 知らせない。**props / children で親が渡す**（子は自分の見た目だけに責任を持つ） |

**レビュー観点**: import 文の向きを見る。下位レイヤのファイルに上位レイヤ（ルートセグメント / `components/`）へのパスが現れていたら指摘する。Client Component がサーバー専用モジュールを引き込んでいないか。

> **現状**: `components/` から `lib/api/` への直接 import は #130 で解消済み（`Home` / `BlogPost` / `NewPost` / `EditPost` は `hooks/` の `useBlogs` `useBlog` `useBlogMarkdown` `useCreateBlog` `useUpdateBlog` `useDeleteBlog` 経由）。全ページ CSR のため、データ取得はサーバーコンポーネントではなく `hooks/` で行っている。上表は全項目を現時点から守る。

## 型の扱い（API の形を画面に持ち込まない）

**API のレスポンス型と、画面が使う型を分ける。**

| 種類 | 役割 | 置き場所 |
|---|---|---|
| **API 契約の型** | バックエンド / BFF が返す形。サーバー側の都合で変わる | `types/`（**BFF と共有**して 1 箇所定義にする。`api-bff.md`「型定義」参照） |
| **ビューモデル** | 画面が必要とする形。UI 要件で変わる | `types/`、単一画面用なら該当コンポーネントにコロケーション |

**本プロジェクトは BFF あり構成**（`app/api/`）のため、**変換は BFF が担当する**。画面単位のレスポンス型を BFF 側で定義し、その形に整形して返す。フロントは共有された型をそのまま使い、**再変換しない**（変換層を二重に置かない）。

- **理由**: バックエンドのフィールド名変更が画面のあちこちに波及するのを防ぐ。API 契約とビューは**変わる理由が違う**。
- 表示専用の整形（日付フォーマット・タグの並べ替え・件数表記）は**コンポーネント側または `lib/` の純粋関数**で行い、**API 契約の型に表示都合のフィールドを足さない**。
- ただし**両者が完全に一致し、変換が恒久的に無意味な場合は同じ型を使ってよい**（早すぎる抽象化を避ける）。**表示都合の差が出た時点で分ける**。

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
├── lib/api/                # API アクセス（fetch はここだけ・移行目標: repositories/）
├── provider/               # QueryProvider / ToastProvider
├── schema/                 # Zod スキーマ（移行目標: schemas/）
├── stores/                 # Zustand Store
├── types/                  # 型定義
└── utils/const/            # 定数（constants.ts・移行目標: constants/ へドメイン分割）
```

## バリデーション

- フォームバリデーションには **react-hook-form + Zod**（`@hookform/resolvers` の `zodResolver`）を使用する。`typescript.md`「スキーマバリデーションは Zod に統一する」に従い、`yup` 等と**混在させない**。
- **スキーマを単一の真実とする**。フォームの型は `z.infer<typeof schema>` で導出し、同じ形を手書きしない。
- **クライアント検証は UX のためのものであり、セキュリティ担保ではない**。BFF の Route Handler・バックエンドでも必ず検証する（信頼境界が違うため、この重複は必要）。クライアント側の検証だけで通した入力を BFF がそのまま転送しない。
- 同じ入力ルールなら、**BFF と同じ Zod スキーマを共有**する（`schema/` に置いて双方から参照）。制約値だけでも定数で共有する。

## インポート

- `@/*` パスエイリアスを使用する（相対パスの深いネストを避ける）。`@/*` は `apps/front/src/*` を指す。

## 通知

- 通知は **react-hot-toast** を使用する。全操作の成功/失敗をトーストで通知する。
- トーストのメッセージ文言は**共通定数に集約**し、コンポーネントに直書きしない。現状の置き場は `utils/const/constants.ts`（`COMMON_CONSTANTS`）。ドメイン単位への分割は移行目標であり、`typescript.md`「定数の配置」に従う。

## テスト

- E2E: Playwright（`apps/front/e2e/`）
- Base URL: `http://localhost:3000`
