# nextjs-echo-blog-front-app-renew

Next.js + TypeScript で構築された Markdown ブログアプリのフロントエンド（リニューアル版）。バックエンドは Echo + Go（別リポジトリ）。

**モノレポ構成**: pnpm ワークスペースで管理し、フロントアプリは `apps/front/` に集約している。リポジトリ直下はワークスペース管理（`package.json` / `pnpm-workspace.yaml` / `pnpm-lock.yaml`）と横断ドキュメント・インフラ（`docs/` `manuals/` `terraform/` `.github/`）を置く。将来的な共有パッケージは `packages/` に配置する。

## Rules

明示的な指示がなくても、`.claude/rules/` 内のルールを常に守ってください。

| ファイル | スコープ | 内容 |
|---------|---------|------|
| shortcuts.md | 全体 | 指示ショートカット（PR出して、PR承認しました 等） |
| workflow.md | 全体 | 開発フロー（ブランチ運用・テスト必須） |
| quality-gate.md | 全体 | 品質ゲート（セルフレビュー・設計/実装レビュー） |
| documentation.md | 全体 | ドキュメント更新ルール |
| git.md | 全体 | GitHub Flow・ブランチ命名・push 禁止物 |
| github-issue.md | 全体 | GitHub issue 運用（ブランチと対で起票・open/close で進捗管理・PR 自動クローズ・サブ issue） |
| testing.md | 全体 | テスト分類・原則・テストツール・テストファイル配置 |
| coding-standards.md | 全体 | 言語・パッケージマネージャ・Linter/Formatter・Prettier 設定・パスエイリアス |
| error-handling.md | 全体 | エラーハンドリング方針（バリデーション・例外処理） |
| security.md | 全体 | セキュリティ設計方針（認証・通信・インジェクション対策・シークレット管理） |
| typescript.md | `apps/front/src/**` | TS 固有規約（type/interface・型/定数の配置・any 禁止・enum 回避・import type） |
| jsdoc.md | `apps/front/src/**` | JSDoc（TSDoc）規約・公開シンボル/型メンバー/状態層（store・context・hooks）に必須 |
| frontend.md | `apps/front/src/app/`（api 除く） | Next.js App Router 設計・コンポーネント・状態管理・通知 |
| api-bff.md | `apps/front/src/app/api/**` | Next.js BFF（Route Handlers）設計・バックエンド URL 秘匿・fail-closed |

## ドキュメント参照先

| 内容 | 参照先 |
|------|--------|
| 仕様書・設計ドキュメントの目次（全体索引） | [docs/README.md](./docs/README.md) |
| セットアップ・開発コマンド・デプロイ概要 | [README.md](./README.md) |
| 環境変数 | [manuals/environment.md](./manuals/environment.md) |
| アーキテクチャ（Provider 構成・データフロー・デプロイ詳細） | [docs/09-architecture-specification.md](./docs/09-architecture-specification.md) |
| コード規約・ESLint・Prettier 詳細 | [docs/10-miscellaneous-specification.md](./docs/10-miscellaneous-specification.md) |
| 型定義 | `apps/front/src/app/types/` |

## ディレクトリ構成（概要）

リポジトリ直下（モノレポルート）:

- `apps/front/` - フロントアプリ本体（Next.js）
- `packages/` - 将来の共有パッケージ用（現状は空）
- `docs/` `manuals/` `terraform/` `.github/` - 横断ドキュメント・インフラ・CI/CD

フロントアプリ（`apps/front/`）配下:

- `src/app/(auth)/` - 認証ルート（login, register）
- `src/app/(common)/` - メインルート（blog, category, tag, new, edit）
- `src/app/components/` - React コンポーネント
- `src/app/lib/api/` - API 通信関数
- `src/app/hooks/` - カスタムフック
- `src/app/schema/` - Zod バリデーションスキーマ
- `src/app/types/` - TypeScript 型定義
- `src/app/utils/const/constants.ts` - API エンドポイント・定数

> パスエイリアス `@/*` は `apps/front/src/*` を指す（`apps/front/tsconfig.json` 基準）。

詳細なディレクトリ構成は [docs/09-architecture-specification.md](./docs/09-architecture-specification.md#2-ディレクトリ構成) を参照。
