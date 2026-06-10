# ドキュメント索引

TechBlog（`nextjs-echo-blog-front-app-renew`）フロントエンドの仕様・設計ドキュメント一覧。プロジェクト概要はリポジトリ直下の [`../README.md`](../README.md) を参照。

ドキュメントは 4 層で構成している。

- **標準仕様書（`01`〜`11`）** — 仕様の正準。番号順に読むと全体像をつかめる。
- **[`learning/`](./learning/)** — 採用ライブラリ・技術の学習ノート（参考資料）。
- **[`test-design/`](./test-design/)** — テスト設計の詳細ケース表。
- **セキュリティレポート** — Dependabot 対応・API 露出対策などの実施記録（履歴）。

## 読み進め順（おすすめ）

`01 ビジネス要件 → 02 要件 → 03 機能 → 05 データ → 06 セキュリティ → 07 API → 08 テスト → 09 アーキテクチャ`。
04・10・11 は随時参照。初めて環境構築する場合は [`../README.md`](../README.md) のセットアップ手順と [`../manuals/environment.md`](../manuals/environment.md)（環境変数）から。

## 標準仕様書

| # | ドキュメント | 概要 |
|---|---|---|
| 01 | [ビジネス要件定義書](./01-business-requirements.md) | 背景・目的・ターゲット・スコープ・制約 |
| 02 | [要件定義書](./02-requirements-specification.md) | 機能要件（FR-01〜10）・非機能要件概要・画面一覧 |
| 03 | [機能仕様書](./03-functional-specification.md) | 画面仕様・操作フロー・データフロー・共通レイアウト |
| 04 | [非機能仕様書](./04-non-functional-specification.md) | 性能・スケーラビリティ・可用性・保守性・テスト・運用 |
| 05 | [データ仕様書](./05-data-specification.md) | 型定義・Zod スキーマ・データ変換・状態管理 |
| 06 | [セキュリティ仕様書](./06-security-specification.md) | BFF プロキシ・認証認可・GitHub プロキシ・シークレット管理 |
| 07 | [API 仕様書](./07-api-specification.md) | Route Handler（BFF）・プロキシ先・クライアント API 関数 |
| 08 | [テスト仕様書](./08-test-specification.md) | テスト戦略・ユニット/E2E・モック構成・テストケース一覧 |
| 09 | [アーキテクチャ仕様書](./09-architecture-specification.md) | 技術スタック・ディレクトリ構成・Provider・デプロイ |
| 10 | [その他仕様書](./10-miscellaneous-specification.md) | コード規約・環境変数・開発コマンド・CI/CD・依存パッケージ |
| 11 | [タスク](./11-tasks.md) | 完了済み実績・既知の課題・今後の改善候補 |

## learning/ — 技術学習ノート

| ドキュメント | 対象 |
|---|---|
| [01-tanstack-query](./learning/01-tanstack-query.md) | TanStack Query（サーバー状態管理・キャッシュ） |
| [02-zustand](./learning/02-zustand.md) | Zustand（ローカル UI 状態管理） |
| [03-react-hook-form-zod](./learning/03-react-hook-form-zod.md) | React Hook Form + Zod（フォーム・バリデーション） |
| [04-bff-proxy-route-handlers](./learning/04-bff-proxy-route-handlers.md) | BFF プロキシ（Next.js Route Handlers） |
| [05-react-hot-toast](./learning/05-react-hot-toast.md) | react-hot-toast（通知） |

## test-design/ — テスト設計

| ドキュメント | 対象 |
|---|---|
| [01-unit-schema](./test-design/01-unit-schema.md) | Zod スキーマのユニットテスト |
| [02-unit-hooks](./test-design/02-unit-hooks.md) | カスタムフック（useComments / useDebounce / useLikeBlog） |
| [03-e2e-smoke](./test-design/03-e2e-smoke.md) | E2E スモークテスト |

## セキュリティレポート — 運用・履歴

| ドキュメント | 概要 |
|---|---|
| [security-report](./security-report.md) | Dependabot アラート対応（2026-01-31・Next.js 14→16 他） |
| [security-alert-fix-2026-03-21](./security-alert-fix-2026-03-21.md) | Dependabot アラート対応（2026-03-21） |
| [security-api-proxy-report](./security-api-proxy-report.md) | バックエンド API 露出対策（BFF プロキシ導入） |

## 関連

- セットアップ・開発手順: リポジトリ直下の [`../README.md`](../README.md)
- 環境変数・運用マニュアル（正準）: [`../manuals/`](../manuals/) — `docs/` が「仕様」を扱うのに対し、`manuals/` は環境変数・シークレット・運用手順といった「構築・運用」の正準を置く。
- 開発ルール: [`../CLAUDE.md`](../CLAUDE.md) と [`../.claude/rules/`](../.claude/rules/)
- ドキュメント更新の影響マップ（変更種別 → 更新必須ドキュメント）: [`../.claude/rules/documentation.md`](../.claude/rules/documentation.md)
