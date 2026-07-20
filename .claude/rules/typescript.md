---
description: TypeScript コーディング規約 — type/interface の使い分け等、TS 固有の指針
globs: "apps/front/src/**"
---

# TypeScript コーディング規約

共通の `coding-standards.md` に加え、TypeScript 固有の指針を定める。命名規則は Linter 既定に委ね、本書では扱わない。

## type vs interface

**原則 `type` を使う。** class が絡む契約のみ `interface` を使う。

判断基準は「その型を **class が `implements` / `extends` するか**」:

- **`interface` を使う**（class 契約）
  - class が `implements` する契約（サービス契約・リポジトリポート・DI 抽象）
  - class ベースで拡張される型
- **`type` を使う**（上記以外すべて）
  - class が絡まないオブジェクト形状（props・DTO・レスポンス型）
  - union / 交差 / tuple / 関数型 / mapped・conditional 型などの型演算
  - → 本プロジェクトは React の**関数・データ中心の層**のみで構成されるため、実質すべて `type` が該当する

```ts
// class が絡まない → type（props・データ・union・関数型）
type BlogSortBy = 'newest' | 'popular';
type BlogCardProps = { id: string; title: string; likes: number };
type OnSelectTag = (tag: string) => void;
```

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
