---
description: ドキュメント更新・設計書管理ルール（影響マップ + opt-out の完了条件）
globs:
---

# ドキュメント

コード変更がドキュメント（CLAUDE.md / README.md / docs/）と乖離しないことを構造的に担保する。

## 完了条件（opt-out）

変更は、下記「影響マップ」の対応ドキュメントを**同一 PR 内で更新する**ことを完了条件とする。

- 更新不要と判断した場合は、**PR 説明にその理由を明記する**（省略＝未対応とみなす）。
- この乖離チェックは `/self-review` と `/pr-create` の確認対象に含まれる。

## 影響マップ（変更種別 → 更新必須ドキュメント）

「どのドキュメントだっけ？」を考えさせないための逆引き表。

| 変更種別 | 更新必須ドキュメント |
|---|---|
| セットアップ手順・開発/ビルド/デプロイコマンドの変更 | README.md |
| 環境変数の追加・変更・削除 | manuals/environment.md |
| ルーティング・画面・機能の追加/変更 | docs/03-functional-specification.md |
| API 通信関数・エンドポイント・リクエスト/レスポンス契約の変更 | docs/07-api-specification.md, src/app/utils/const/constants.ts |
| 型定義・Zod スキーマ・データ構造の変更 | docs/05-data-specification.md, src/app/types/, src/app/schema/ |
| Provider 構成・データフロー・ディレクトリ構成・デプロイ構成の変更 | docs/09-architecture-specification.md |
| 認証・認可・セキュリティ方針の変更 | docs/06-security-specification.md |
| 非機能要件（性能・可用性・運用方針 等）の変更 | docs/04-non-functional-specification.md |
| テスト方針・テスト観点・テストケースの追加/変更 | docs/08-test-specification.md, docs/test-design/ |
| コード規約・ESLint・Prettier 設定の変更 | docs/10-miscellaneous-specification.md |
| 上記に当てはまらない補足事項の変更 | docs/11-tasks.md ほか該当する docs/ |

該当する変更がない場合はスキップする。

## 補足

- **設計書の管理**: タスクごとに設計書を新規作成しない。既存の仕様書ドキュメント（docs/01〜11-*.md, docs/test-design/）に追記・更新する。
