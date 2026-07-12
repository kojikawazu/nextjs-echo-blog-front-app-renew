# タスク管理（Tasks）

## 目次

- [進行中](#進行中)
    - [パッケージマネージャー移行（npm → pnpm）\[#62\](https://github.com/kojikawazu/nextjs-echo-blog-front-app-renew/issues/62)](#パッケージマネージャー移行npm--pnpm62httpsgithubcomkojikawazunextjs-echo-blog-front-app-renewissues62)
- [完了済み](#完了済み)
    - [セキュリティ対応](#セキュリティ対応)
    - [基本機能](#基本機能)
    - [インフラ・デプロイ](#インフラデプロイ)
    - [テスト](#テスト)
    - [ドキュメント](#ドキュメント)
- [既知の課題](#既知の課題)
- [今後の改善候補](#今後の改善候補)

## 進行中

### モノレポ化（フロントを apps/front へ集約）

- [x] pnpm ワークスペース化（ルート `package.json` + `pnpm-workspace.yaml` の `packages: [apps/*, packages/*]`）
- [x] アプリ一式を `apps/front/` へ移動（`git mv` で履歴保持）・パッケージ名 `frontend` → `front`
- [x] `Dockerfile` をワークスペース対応に書き換え（context=ルート、runner は両 node_modules を COPY）
- [x] GitHub Actions 3ファイル更新（`paths` フィルタ・`--filter front`・`.env(.test)` 生成先・artifact パス）
- [x] `.gitignore` / `.dockerignore` のパス調整、ドキュメント更新
- [ ] 動作確認（ローカル build/test/e2e 済み・Docker ビルドは CI で検証）・PR作成

### パッケージマネージャー移行（npm → pnpm）[#62](https://github.com/kojikawazu/nextjs-echo-blog-front-app-renew/issues/62)

- [x] GitHub issue作成
- [x] ブランチ作成（`chore/migrate-npm-to-pnpm`）
- [x] ドキュメント更新（CLAUDE.md）
- [x] `pnpm-lock.yaml` 生成（`pnpm import`）・`package-lock.json` 削除
- [x] `Dockerfile` 修正
- [x] GitHub Actions ワークフロー修正（3ファイル）
- [ ] 動作確認・PR作成

## 完了済み

### セキュリティ対応

- [x] Dependabotアラート全16件の対応（2026-01-31）
  - Next.js 14 → 16 メジャーアップグレード
  - ESLint 8 → 9 メジャーアップグレード（フラットコンフィグ移行）
  - Node.js 18 → 20 移行
  - 動的ルートのparamsをPromise対応に修正
  - 詳細: `docs/security-report.md`

- [x] Dependabotアラート7件の対応（2026-03-21）
  - Next.js 16.1.6 → 16.2.1 アップグレード
  - minimatch 3.1.2 → 3.1.5 / 9.0.5 → 9.0.9 アップグレード
  - 詳細: `docs/security-alert-fix-2026-03-21.md`

- [x] バックエンドAPI露出対策（2026-03-19）
  - BFFプロキシ（Next.js Route Handlers）の導入
  - `NEXT_PUBLIC_BACKEND_API_URL` → `BACKEND_API_URL`（サーバーサイド専用に変更）
  - GitHubプロキシのセキュリティ強化（オーナーホワイトリスト、fail-closed設計）
  - シークレットをGCP Secret Managerに移行
  - E2Eモックの追従
  - CI/CD・Terraform・ドキュメント更新
  - 詳細: `docs/security-api-proxy-report.md`

### 基本機能

- [x] ブログ一覧表示（検索、フィルタ、ソート、ページネーション）
- [x] ブログ詳細表示（GitHub Markdownレンダリング）
- [x] ユーザー認証（ログイン/ログアウト）
- [ ] 新規登録（UIのみ実装、バックエンドAPI未連携）
- [x] 記事CRUD（作成/読取/更新/削除）
- [x] いいね機能（訪問者ID方式）
- [x] コメント機能（ゲスト投稿）
- [ ] コメントリプライ機能（型定義のみ、UI・API送信は未実装）
- [x] サイドバー（カテゴリ、人気記事、タグ）

### インフラ・デプロイ

- [x] Docker化（マルチステージビルド）
- [x] GitHub Actions CI/CD
- [x] Google Cloud Run デプロイ
- [x] Cloudflare導入
- [x] Terraform構成管理

### テスト

- [x] Playwright E2Eテスト環境構築
- [x] ユニットテスト環境構築（Vitest + @testing-library）
- [x] スキーマのユニットテスト（authSchema, blogSchema, blogCommentSchema）
- [x] カスタムフックのユニットテスト（useComments, useDebounce, useLikeBlog）
- [x] API通信関数のユニットテスト（fetchBlogs: ソート/フィルタ/変換/異常系）
- [x] `fetchBlogs` の newest ソート精度修正（日付整形をソート後に移し、同日内の時刻順を保持）
- [x] レイアウトテスト（Header、Footer）
- [x] 認証テスト（ログイン）
- [x] ブログホームテスト（一覧、検索、ページネーション、サイドバー）
- [x] ブログ詳細テスト（表示、コメント）
- [x] ブログ作成テスト
- [x] ブログ編集・削除テスト

### ドキュメント

- [x] CLAUDE.md 作成
- [x] README.md 作成
- [x] 仕様書一式作成（01〜11）

## 既知の課題

- [ ] 新規登録（`/register`）のバックエンドAPI連携が未実装（UIのみスタブ）
- [ ] コメントのリプライ機能が未実装（型定義の `parent_id` のみ存在、UI・API送信なし）
- [ ] フィルタ・検索・ソート変更時にページが1にリセットされない
- [ ] サイドバーの人気記事の算出元がページによって異なる（ホーム`/`は現在ページのブログデータから算出、その他ページは `/api/blogs/popular/:count` から全体TOP5を取得）。一貫性に欠ける
- [ ] ブログ作成/編集フォームのZodスキーマが全フィールド `optional()` で、必須チェックがHTML `required` 属性依存
- [ ] 訪問者IDの生成結果がフロント側で永続化されていない（バックエンドCookie依存の可能性）

## 今後の改善候補

- [ ] ユニットテストのカバレッジ拡充（現在はスキーマ・カスタムフックのみ。コンポーネント等へ拡大）
- [ ] SSR / SSGの活用（現在は全ページCSR）
- [ ] 画像アップロード機能
- [ ] ブログ記事のOGP設定
- [ ] アクセス解析の導入
- [ ] PWA対応
- [ ] ダークモード対応
- [ ] 利用規約・プライバシーポリシーページ（Footer内でコメントアウト中）
