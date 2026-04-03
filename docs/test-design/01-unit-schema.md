# テスト設計: Zodスキーマ ユニットテスト

## 対象

- 対象機能: フォーム入力バリデーション
- 対象ファイル:
  - `src/app/schema/authSchema.ts` — loginSchema / registerSchema
  - `src/app/schema/blogCommentSchema.ts` — blogCommentSchema
  - `src/app/schema/blogSchema.ts` — blogCreateSchema / blogEditSchema
- スタック: TypeScript / Vitest
- テストファイル:
  - `src/app/schema/__tests__/authSchema.test.ts`
  - `src/app/schema/__tests__/blogCommentSchema.test.ts`
  - `src/app/schema/__tests__/blogSchema.test.ts`

## 既知の課題（テストで明示化する）

`blogSchema` / `blogCommentSchema` の全フィールドが `.optional()` であるため、
必須チェックが HTML `required` 属性依存になっている。
テストではこの **「空文字でも通過する」** 挙動を明示的に記録し、
将来 optional() を外した際のリグレッション検知として機能させる。

---

## loginSchema

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 有効なメール・パスワード | `{ email: "user@example.com", password: "pass123" }` | エラーなし、parseが成功 | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | メール形式が不正 | `{ email: "not-email", password: "pass123" }` | `email` にエラー | High |
| S-2 | パスワードが5文字以下 | `{ email: "user@example.com", password: "abc" }` | `password` にエラー | High |
| S-3 | メールが空 | `{ email: "", password: "pass123" }` | `email` にエラー | High |

---

## registerSchema

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 有効な名前・メール・パスワード | `{ name: "太郎", email: "user@example.com", password: "pass123" }` | エラーなし | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | 名前が1文字 | `{ name: "太", ... }` | `name` にエラー | High |
| S-2 | メール形式が不正 | `{ name: "太郎", email: "bad", password: "pass123" }` | `email` にエラー | High |

---

## blogCommentSchema（既知課題の記録）

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 全フィールド有効値 | `{ blog_id: "abc", guest_user: "太郎", comment: "良い記事" }` | エラーなし | High |

### 準正常系（optional()により空文字が通過することの記録）

| # | テストケース | 入力 | 期待結果 | 優先度 | 備考 |
|---|---|---|---|---|---|
| S-1 | comment が空（optional のため通過） | `{ comment: "" }` | **エラーなし**（通過） | High | 既知課題: optional()があるため空でも通る |
| S-2 | 全フィールド未指定（undefined） | `{}` | エラーなし（全optional） | High | 既知課題の明示 |

---

## blogCreateSchema / blogEditSchema（既知課題の記録）

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 全フィールド有効値 | `{ title: "タイトル", category: "Tech", ... }` | エラーなし | High |
| N-2 | github_url が有効なURL | `{ github_url: "https://github.com/foo/bar" }` | エラーなし | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 | 備考 |
|---|---|---|---|---|---|
| S-1 | github_url が不正なURL | `{ github_url: "not-a-url" }` | `github_url` にエラー | High | urlバリデーションは機能する |
| S-2 | title が空（optional のため通過） | `{ title: "" }` | **エラーなし**（通過） | High | 既知課題: optional()があるため空でも通る |
| S-3 | 全フィールド未指定 | `{}` | エラーなし（全optional） | High | 既知課題の明示 |

## モック方針

- モック: **不要**（Zodスキーマは純粋関数）
