# nextjs-echo-blog-front-app-renew

Next.js + TypeScript で構築された Markdown ブログアプリのフロントエンド（リニューアル版）。バックエンドは Echo + Go（別リポジトリ）。

## Rules

明示的な指示がなくても、`.claude/rules/` 内のルールを常に守ってください。

| ファイル | スコープ | 内容 |
|---------|---------|------|
| shortcuts.md | 全体 | 指示ショートカット（PR出して、PR承認しました 等） |
| workflow.md | 全体 | 開発フロー（ブランチ運用・テスト必須） |
| quality-gate.md | 全体 | 品質ゲート（セルフレビュー・設計/実装レビュー） |
| documentation.md | 全体 | ドキュメント更新ルール |
| git.md | 全体 | GitHub Flow・ブランチ命名・push 禁止物 |
| testing.md | 全体 | テスト分類・原則 |
| code-style.md | 全体 | コード規約・状態管理の使い分け |

## ドキュメント参照先

| 内容 | 参照先 |
|------|--------|
| セットアップ・開発コマンド・デプロイ概要 | [README.md](./README.md) |
| 環境変数 | [manuals/environment.md](./manuals/environment.md) |
| アーキテクチャ（Provider 構成・データフロー・デプロイ詳細） | [docs/09-architecture-specification.md](./docs/09-architecture-specification.md) |
| コード規約・ESLint・Prettier 詳細 | [docs/10-miscellaneous-specification.md](./docs/10-miscellaneous-specification.md) |
| 型定義 | `src/app/types/` |

## ディレクトリ構成（概要）

- `src/app/(auth)/` - 認証ルート（login, register）
- `src/app/(common)/` - メインルート（blog, category, tag, new, edit）
- `src/app/components/` - React コンポーネント
- `src/app/lib/api/` - API 通信関数
- `src/app/hooks/` - カスタムフック
- `src/app/schema/` - Zod バリデーションスキーマ
- `src/app/types/` - TypeScript 型定義
- `src/app/utils/const/constants.ts` - API エンドポイント・定数

詳細なディレクトリ構成は [docs/09-architecture-specification.md](./docs/09-architecture-specification.md#2-ディレクトリ構成) を参照。
