# テスト仕様書（Test Specification）

## 1. テスト戦略

### テスト種別

| 種別 | フレームワーク | 目的 |
|------|-------------|------|
| E2E（End-to-End） | Playwright | ユーザー操作に基づく画面レベルの自動テスト |

### テスト方針

- APIレスポンスは全てモック化し、バックエンドに依存しないテストを実現
- 認証状態（認証済み/未認証）を切り替えてテスト
- CI環境（GitHub Actions）ではリトライ2回で安定性を確保

## 2. テスト環境

### 設定（`playwright.config.ts`）

| 項目 | 値 |
|------|-----|
| テストディレクトリ | `./e2e/tests` |
| ベースURL | `http://localhost:3000` |
| タイムアウト | 30秒/テスト |
| リトライ | CI: 2回 / ローカル: 0回 |
| レポート | HTML形式（`playwright-report/`） |
| トレース | 初回リトライ時に記録 |
| 開発サーバー | `npm run dev`（CI時は自動起動） |
| 環境変数 | `.env.test` から読み込み |

### テスト実行コマンド

```bash
npm run test:e2e              # HTMLレポート付き
npm run test:e2e:ui           # インタラクティブUI
npm run test:e2e:headed       # ブラウザ表示
npx playwright test <path>    # 特定テストのみ
```

## 3. モック構成

### ディレクトリ構造

```
e2e/tests/mocks/
├── api/
│   ├── auth-api-mock.ts       # 認証APIモック
│   ├── blog-api-mock.ts       # ブログAPIモック
│   └── blog-comment-api-mock.ts # コメントAPIモック
└── blog/
    ├── blog-mock.ts           # ブログモックデータ
    └── blog-comment-mock.ts   # コメントモックデータ
```

### APIモック関数一覧

#### 認証モック（`auth-api-mock.ts`）

| 関数 | 説明 | モック対象 |
|------|------|----------|
| `setupAuthCheckMock(page, { authenticated })` | 認証チェック | `**/api/auth/check` |
| `setupLoginMock(page, { success })` | ログイン | `**/api/auth/login` |
| `setupLogoutMock(page, { success })` | ログアウト | `**/api/auth/logout` |

#### ブログモック（`blog-api-mock.ts`）

| 関数 | 説明 | モック対象 |
|------|------|----------|
| `setupFetchBlogsMock(page, blogs)` | ブログ一覧取得 | `**/api/blogs` (GET) |
| `setupFetchBlogByIdMock(page, blog)` | ブログ詳細取得 | `**/api/blogs/{id}` |
| `setupFetchSidebarMock(page, categories, tags, popular)` | サイドバーデータ | `**/api/blogs/categories`, `tags`, `popular/*` |
| `mockCreateBlogAPI(page, { status, responseBody })` | ブログ作成 | `**/api/blogs` (POST) |
| `mockUpdateBlogAPI(page, { status, responseBody })` | ブログ更新 | `**/api/blogs/*` (PUT) |
| `mockDeleteBlogAPI(page, status, responseBody)` | ブログ削除 | `**/api/blogs/*` (DELETE) |

#### コメントモック（`blog-comment-api-mock.ts`）

| 関数 | 説明 | モック対象 |
|------|------|----------|
| コメント取得モック | コメント一覧取得 | `**/api/comments/{blogId}` |
| コメント作成モック | コメント投稿 | `**/api/comments` |

### モックのHTTPメソッドチェック

ブログAPIモックではHTTPメソッドをチェックし、意図しないメソッドのリクエストは `route.fallback()` で処理する。これにより、同一パスのGET/POST/PUT/DELETEを正しくモック分離できる。

## 4. テストケース一覧

### レイアウトテスト

#### `e2e/tests/layout/footer.spec.ts`

| テスト | 説明 |
|--------|------|
| フッター表示 | フッターの各セクション（サイト概要、リンク、フォロー）が正しく表示される |

#### `e2e/tests/layout/header_unauthenticated.spec.ts`

| テスト | 説明 |
|--------|------|
| 未認証ヘッダー表示 | ロゴ、記事一覧リンク、ログインボタンが表示される |
| 新規投稿リンク非表示 | 未認証時に「新規投稿」が表示されない |

#### `e2e/tests/layout/header_authenticated.spec.ts`

| テスト | 説明 |
|--------|------|
| 認証済みヘッダー表示 | ユーザー名、新規投稿リンク、ログアウトボタンが表示される |
| ログインボタン非表示 | 認証時に「ログイン」ボタンが表示されない |

### 認証テスト

#### `e2e/tests/pages/auth/login.spec.ts`

| テスト | 説明 |
|--------|------|
| ログインフォーム表示 | メール・パスワード入力欄とログインボタンが表示される |
| ログイン成功 | 正しい認証情報でログインし、ホームへリダイレクト |
| ログイン失敗 | 不正な認証情報でエラーメッセージが表示される |

#### `e2e/tests/pages/auth/hello.spec.ts`

| テスト | 説明 |
|--------|------|
| Top page is displayed | トップページ（`/`）にアクセスしてタイトルが存在することを確認する動作確認用テスト |

### ブログホームテスト

#### `e2e/tests/pages/blog_home/blog_home_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| 記事一覧表示 | 未認証でブログ記事カードが表示される |
| 最新の記事見出し | 「最新の記事」が表示される |

#### `e2e/tests/pages/blog_home/blog_home_auth.spec.ts`

| テスト | 説明 |
|--------|------|
| 認証済み表示 | 認証ユーザーとしてホーム画面が正しく表示される |
| 新規投稿リンク | 認証時に新規投稿への導線が有効 |

#### `e2e/tests/pages/blog_home/blog_home_search_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| 検索機能 | 検索ボックスにキーワードを入力して記事がフィルタされる |

#### `e2e/tests/pages/blog_home/blog_home_paging_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| ページネーション | ページ切替が正しく動作する |

#### `e2e/tests/pages/blog_home/blog_home_aside_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| サイドバー表示 | カテゴリ、人気記事、タグが正しく表示される |
| サイドバーリンク | カテゴリ・タグクリックで適切なページへ遷移する |

### ブログ詳細テスト

#### `e2e/tests/pages/blog_detail/blog_detail_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| 記事詳細表示 | タイトル、タグ、本文が正しく表示される |
| Markdown表示 | GitHub Markdownが正しくレンダリングされる |

#### `e2e/tests/pages/blog_detail/blog_detail_comment_unauth.spec.ts`

| テスト | 説明 |
|--------|------|
| コメント表示 | コメント一覧が正しく表示される |
| コメント投稿 | ゲストユーザーがコメントを投稿できる |

### ブログ作成テスト

#### `e2e/tests/pages/blog_new_form/blog_new_form.spec.ts`

| テスト | 説明 |
|--------|------|
| フォーム表示 | 全入力項目が表示される |
| 記事作成 | フォーム入力 → 確認モーダル → 作成完了 |
| バリデーション | 不正入力時にエラーメッセージが表示される |

### ブログ編集・削除テスト

#### `e2e/tests/pages/blog_edit_form/blog_edit_form.spec.ts`

| テスト | 説明 |
|--------|------|
| フォーム初期値 | 既存データがフォームに設定される |
| 記事更新 | フォーム編集 → 確認モーダル → 更新完了 |

#### `e2e/tests/pages/blog_edit_form/blog_edit_del.spec.ts`

| テスト | 説明 |
|--------|------|
| 記事削除 | 削除ボタン → 確認モーダル → 削除完了 |

## 5. CI/CD統合

### GitHub Actions（`test.yml`）

```yaml
# テスト環境変数
.env.test にテスト用の環境変数を書き出し

# 実行
npx playwright test --reporter=html

# リトライ
CI環境では2回リトライ
```

### テスト実行の流れ

```
PR / push → GitHub Actions → npm ci → .env.test 作成 → npm run dev (バックグラウンド) → playwright test
```
