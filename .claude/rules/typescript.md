---
description: TypeScript コーディング規約 — type/interface の使い分け・型/定数の配置等、TS 固有の指針
globs: "apps/front/src/**"
---

# TypeScript コーディング規約

共通の `coding-standards.md` に加え、TypeScript 固有の指針を定める。命名規則は Linter 既定に委ね、本書では扱わない。

## type vs interface

**原則 `type` を使う。** 以下の 2 条件のいずれかに当たる場合のみ `interface` を使う。

- **条件 1: class 契約** — その型を **class が `implements` / `extends` する**
  - サービス契約・リポジトリポート・DI 抽象など
  - → 本プロジェクトは React の**関数・データ中心の層**のみで構成されるため、実質該当しない
- **条件 2: 宣言マージが必要** — 型を**後から拡張する**必要がある
  - グローバル型の拡張（`declare global { interface Window { ... } }`）
  - ライブラリ型の拡張（`declare module 'next/server' { ... }`）
  - → `type` は宣言マージできないため、ここは `interface` でしか実現できない
- **`type` を使う**（上記以外すべて）
  - class が絡まないオブジェクト形状（props・DTO・レスポンス型）
  - union / 交差 / tuple / 関数型 / mapped・conditional 型などの型演算

宣言マージは「意図せず型が拡張され得る」副作用でもある。**アプリ内部の型に `interface` を選ぶ理由にはしない**（条件 1 か、外部から拡張される前提の型に限る）。

```ts
// class が絡まない → type（props・データ・union・関数型）
type BlogSortBy = 'newest' | 'popular';
type BlogCardProps = { id: string; title: string; likes: number };
type OnSelectTag = (tag: string) => void;
```

> **現状**: `types/blogs.ts` `types/users.ts` および各コンポーネントの props（`BlogCardProps` 等）は `interface` で定義されている。既存コードは即違反としない。`type` への統一は `docs/11-tasks.md` の改善候補として管理し、**新規追加分から `type` を使う**。

## 型定義の配置（コロケーション / `types/` 集約）

型を各ファイルに散在させず、**参照範囲**で置き場所を決める。判断軸は「**その型を参照するファイルが 1 つに閉じるか**」。

| 参照範囲 | 置き場所 |
|---|---|
| **1 ファイルに閉じる** | その定義ファイル内にコロケーション（`export` しない） |
| **2 ファイル以上** / レイヤ・機能をまたぐ | `types/` に集約して `export` |

### 運用ルール

- **最初から `types/` に置かない。** まず定義ファイル内に書き、**2 箇所目の参照が発生した時点で `types/` へ昇格**させる。先回りの集約は、使われない共通型と不要な依存を増やす。
- **昇格時は元ファイルに型を残さない**（re-export も含む）。定義は常に 1 箇所。
- `types/` はドメイン単位でファイルを分ける（`types/blogs.ts` / `types/users.ts`）。1 ファイルに全ドメインを詰めない。
- **barrel（`types/index.ts` からの一括 re-export）は作らない。** 循環参照・バンドル肥大・tree-shaking 阻害の原因になる。`import type { Blog } from '@/app/types/blogs'` と**実ファイルを直接 import** する。

### 分類の目安

- **`types/` に置く**: API レスポンス/リクエスト型、ドメインエンティティ（`Blog` `Comment` `User`）、複数画面で共有する union リテラル、共通のユーティリティ型
- **コロケーションのまま**: コンポーネントの props 型（コンポーネントと 1:1 で、UI の変更と同時に変わる）、そのファイル内でしか使わない内部型・引数オブジェクト型

```ts
// コンポーネント固有 → コロケーション（export しない）
type BlogCardProps = { blog: Blog; onSelectTag: (tag: string) => void };
export default function BlogCard({ blog, onSelectTag }: BlogCardProps) { /* ... */ }

// 複数箇所から参照 → types/blogs.ts に集約
// types/blogs.ts
export type Blog = { id: string; title: string; tags: string[]; likes: number };
```

### 型へのコメント

`type` / `interface` は**型本体・各メンバーともにコメント必須**。詳細は `jsdoc.md`（必須対象・記述ルール）に従う。

## 定数の配置

**マジックナンバー・マジック文字列を直接書かない。** 分岐条件・API パス・ストレージキー・上限値・リトライ回数などのリテラルは名前付き定数にする。名前が付いていない値は、検索もできず変更漏れも検出できない。

置き場所は型と**同じ「参照範囲」の軸**で決める。

| 参照範囲 | 置き場所 |
|---|---|
| **1 ファイルに閉じる** | その定義ファイルの先頭で `const` 宣言（`export` しない） |
| **2 ファイル以上** / レイヤ・機能をまたぐ | 共通定数へ集約して `export` |

### 運用ルール

- **`lib/` や `utils/` に定数を混ぜない。** 「関数の置き場」と「値の置き場」を分けると、変更時に探す範囲が狭まる。
- 昇格の運用は型と同じ: まず使う場所に書き、**2 箇所目の参照が発生した時点で共通定数へ移す**。移動時は元ファイルに残さない（re-export も含む）。
- 共通定数は**ドメイン単位でファイルを分ける**（`constants/blogs.ts` / `constants/api.ts`）。1 ファイル・1 オブジェクトに全ドメインを詰めない。**barrel（`constants/index.ts`）は作らない**（理由は型と同じ）。
- **`as const` を付ける。** 付けないとリテラル型が `string` / `number` に広がり、union の導出や補完が効かなくなる。
- 命名は `UPPER_SNAKE_CASE`。オブジェクト定数のキーも同様に揃える。

### 型の元になる定数は「型と同じファイル」に置く

union リテラルの元になる配列・オブジェクトは、**導出される型とセットで `types/` 側に置く**。定数側と `types/` に分けると、値と型が常に往復参照になり、片方だけ更新される事故が起きる。

```ts
// types/blogs.ts — 値と型はペアで同居させる
/** ブログ一覧の並び順。表示順もこの配列の順序に従う。 */
export const BLOG_SORT_BYS = ['newest', 'popular'] as const;
/** ブログ一覧の並び順 */
export type BlogSortBy = (typeof BLOG_SORT_BYS)[number];
```

### 環境変数は定数ではない

環境ごとに値が変わるもの（`BACKEND_API_URL`・トークン・フィーチャーフラグ）を共通定数に置かない。ビルド時に特定環境の値が埋め込まれ、環境差異の事故につながる。**環境変数は `process.env` から読む層に分離する**（BFF のサーバーサイド専用値は `api-bff.md` に従う）。共通定数に置くのは**全環境で不変な値**だけ。

### 定数へのコメント

`export` された定数は**コメント必須**（`jsdoc.md`）。特に**単位**（`TIMEOUT_MS` がミリ秒であること）と**その値である根拠**（「API 側の上限が 100 のため」）を書く。根拠のない数値は、後から誰も変更してよいか判断できない。

> **現状**: 本プロジェクトの共通定数は `utils/const/constants.ts` の `COMMON_CONSTANTS` 1 オブジェクトに集約されている（API パス・リンク・トースト文言・設定値）。上記の「ドメイン単位で `constants/` に分割」「`as const` 付与」は**移行目標**であり、既存コードは即違反としない。移行は `docs/11-tasks.md` の改善候補として管理する。

## any 禁止・unknown 優先

- **暗黙・明示を問わず `any` を禁止**する（`noImplicitAny` 前提）。
- 外部入力（API レスポンス・`JSON.parse`・ユーザー入力）は **`unknown` で受け**、型ガード・スキーマ検証（zod 等）で**ナローイング**してから使う。
- どうしても `any` が必要な箇所は根拠コメントを残す（「as/! 抑制」節参照）。

## enum 回避・union リテラル + as const

- `enum` より **union リテラル型**＋必要なら **`as const`** を優先する。
- 理由: `enum` はランタイムにオブジェクトを生成しバンドルに残る／tree-shaking されにくい／`const enum` は分離コンパイルで問題が出る。union リテラルは型のみで**ランタイムコストゼロ**。

```ts
// 非推奨
enum SortBy { Newest, Popular }
// 推奨
const SORT_BYS = ['newest', 'popular'] as const;
type SortBy = (typeof SORT_BYS)[number];
```

## import type 強制

- 型だけを import する場合は **`import type`** を使う（値と型を混ぜない）。
- 理由: バンドラ／トランスパイラが型を確実に消せる、副作用のない循環参照を避けられる。`verbatimModuleSyntax` 有効化を推奨。

```ts
import type { Blog } from '@/app/types/blogs';
import { fetchBlogs } from '@/app/lib/api/fetchBlogs';
```

## as / ! 抑制

- 型アサーション `as` と non-null assertion `!` を**最小化**する。まず型ガード・早期 return・オプショナルチェーンで解決する。
- 使う場合は**根拠コメント必須**（なぜ安全か／なぜ必要か）。`as unknown as` / `as any` / `@ts-ignore` / `@ts-expect-error` の根拠記述は `jsdoc.md`（混乱テスト）と接続する。
- `as const`（リテラル固定）はここでの「アサーション」に含まない（推奨用途）。
