---
description: テスト分類・原則・テストツール（Vitest / Playwright）・テストファイル配置
globs: 
---

# テストルール

## テスト分類

| 分類 | 定義 |
|------|------|
| 正常系（Normal） | 期待通りの入力 → 正しい結果 |
| 準正常系（Semi-Normal） | 想定内の異常入力 → 適切なハンドリング |
| 異常系（Abnormal） | 想定外のエラー → 安全な失敗 |

## 原則

- テストは仕様の証明。テストが失敗したら実装を修正する（テストを実装に合わせない）。
- 正常系 1 : 異常系（準正常系 + 異常系）2 以上の比率を目安とする。
- ビジネスロジックをモックしない。モックは外部 I/O（HTTP通信、DB接続、ファイルシステム）のみ。
- `toBeTruthy()` 等の曖昧なアサーションを避け、具体的な値で検証する。

## テストツール

| テスト種別 | ツール |
|-----------|--------|
| ユニットテスト | Vitest + Testing Library |
| E2E テスト | Playwright |
| スモークテスト | Playwright（起動確認・主要ページ表示） |

## テストファイル配置

FE はテストを**専用ディレクトリに集約する**（ソースにコロケートしない）:

- **ユニット / コンポーネントテスト**: `tests/` に集約（例: `tests/components/BlogCard.test.tsx`）
- **E2E テスト**: `e2e/` に集約（例: `e2e/tests/pages/blog_home/blog_home_unauth.spec.ts`）
- ソースツリー（`src/`）にテストファイルを置かない。

> **移設済み**: 既存のユニットテスト 8 件は `apps/front/tests/`（ソースツリー鏡写し: `tests/schema/` `tests/hooks/` `tests/lib/api/` `tests/api/github/markdown/`）へ集約済み。SUT は `@/` エイリアスで参照する。
