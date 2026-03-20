# タスク管理（Tasks）

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
- [ ] サイドバーの人気記事が全体TOP5ではなく、現在ページのデータからの算出になっている
- [ ] ブログ作成/編集フォームのZodスキーマが全フィールド `optional()` で、必須チェックがHTML `required` 属性依存
- [ ] 訪問者IDの生成結果がフロント側で永続化されていない（バックエンドCookie依存の可能性）

## 今後の改善候補

- [ ] ユニットテスト追加（Jest / Vitest）
- [ ] SSR / SSGの活用（現在は全ページCSR）
- [ ] 画像アップロード機能
- [ ] ブログ記事のOGP設定
- [ ] アクセス解析の導入
- [ ] PWA対応
- [ ] ダークモード対応
- [ ] 利用規約・プライバシーポリシーページ（Footer内でコメントアウト中）
