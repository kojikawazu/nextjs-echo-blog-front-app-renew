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
- [x] ユニットテストを `tests/` に集約（`src/**/__tests__/` から移設・`.claude/rules/testing.md` 準拠）。ソースツリー鏡写し（`tests/schema/` `tests/hooks/` `tests/lib/api/` `tests/api/github/markdown/`）。相対 import を `@/` エイリアスへ変更、`eslint.config.mjs` の免除 glob に `tests/**` を追加
- [x] ユニットテストの異常系拡充（正常系 20 : 異常系〈準正常+異常〉40 ≒ 1:2 に到達）。スキーマ 3 種へ型不一致・null・非オブジェクトの異常系、`fetchBlogs` へ JSON パース失敗、`useComments` へ mutation 失敗を追加（計 48→60 件）
- [x] インテグレーションテスト（IT）基盤の導入（`tests-it/` + `vitest.config.it.ts` + `pnpm test:it`）。testcontainers で実 Go バックエンド + 実 PostgreSQL を起動し、BFF Route Handler を in-process 検証（UT=mock / IT=testcontainers、バックエンド repo の方針と対）。バックエンドの `Dockerfile` / `schema.sql` / `seed.sql` を再利用。**ローカル（レジストリ接続あり）で `pnpm test:it` グリーン確認済み**
- [x] IT 異常系の拡充（14→19 ケース、正常6 : 異常系13 ≒ 1:2）。`auth.it.test.ts` を追加（auth-check 未認証/不正トークン→200+null の BFF 正規化・login 空/不正メール→400・誤認証→401）
- [x] IT の CI 導入（専用ワークフロー `it-test.yml`・`workflow_dispatch` + nightly）。バックエンドは別 repo（public）を checkout し testcontainers がビルド。`BACKEND_IMAGE` 指定で Artifact Registry の pinned image へ切替可能

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
- [x] ~~ユニットテスト 8 件が `.claude/rules/testing.md` の配置ルールに未追従~~ → `apps/front/tests/`（ソースツリー鏡写し）へ移設済み。`vitest.config.ts` は既定 include で `tests/` を自動検出するため変更不要、`eslint.config.mjs` の免除 glob と `docs/09` ツリーは更新済み

## 既知の課題（IT・型）

- [x] ~~IT のグリーン実行環境~~ → ローカル（レジストリ接続あり）で `pnpm test:it` グリーン確認済み（19 件 pass）。
- [x] ~~IT の CI 導入~~ → 専用ワークフロー `it-test.yml`（`workflow_dispatch` + nightly、sibling checkout + build）を追加。※ nightly 初回実行での通過確認は運用で行う。
- [x] ~~IT 異常系の追加~~ → `auth.it.test.ts`（5 ケース）を追加し 14→19 ケース（≒ 1:2）。
- [ ] **`tsc --noEmit` の型エラー解消**: `tests/hooks/useLikeBlog.test.ts` の `mockResolvedValue(undefined)` が `Promise<string>` と不整合（7 件）。CI は vitest（esbuild）実行のため顕在化していないが、型チェックを CI に加える場合は要修正。
- [ ] **IT のさらなる異常系**（任意）: コメント不在時の挙動（404/空配列）・popular の境界値など、実挙動を観察しつつ追加余地あり。

## 今後の改善候補

- [ ] ESLint で warn に留めている React Hooks 警告の解消（挙動確認しつつ対応）:
  - `react-hooks/set-state-in-effect`（`BlogPost.tsx`・async フェッチ前の loading セット）
  - `react-hooks/exhaustive-deps`（`EditPost.tsx` の `isLoading`・`Home.tsx` の `setGlobalData`）
- [ ] ユニットテストのカバレッジ拡充（現在はスキーマ・カスタムフックのみ。コンポーネント等へ拡大）
- [ ] SSR / SSGの活用（現在は全ページCSR）
- [ ] **定数配置の移行**（`.claude/rules/typescript.md`「定数の配置」の移行目標）: 現在は `utils/const/constants.ts` の `COMMON_CONSTANTS` 1 オブジェクトに全ドメインを集約し `as const` も未付与。ドメイン単位のファイル分割 + `as const` 付与へ段階移行する。`as const` を付けると `BLOG_LIST.POPULAR` 等がリテラル型に固定され、union の導出・補完が効くようになる
- [ ] **型定義の `type` 統一**（`.claude/rules/typescript.md`「type vs interface」の移行目標）: `types/blogs.ts` `types/users.ts` と各コンポーネントの props（`BlogCardProps` 等）が `interface` で定義されている。class 契約・宣言マージのいずれにも該当しないため `type` へ寄せる。新規追加分は `type` を使う
- [ ] **状態・ロジック層のコメント拡充**（`.claude/rules/jsdoc.md`「状態・ロジック層のコメント」）: Zustand ストアの型（`AuthState` / `BlogState` / `CommentState`）と Context value の各メンバーにコメントが未付与。型メンバー単位で「いつ変わるか・空値の意味・副作用の有無」を補う
- [ ] 画像アップロード機能
- [ ] ブログ記事のOGP設定
- [ ] アクセス解析の導入
- [ ] PWA対応
- [ ] ダークモード対応
- [ ] 利用規約・プライバシーポリシーページ（Footer内でコメントアウト中）
