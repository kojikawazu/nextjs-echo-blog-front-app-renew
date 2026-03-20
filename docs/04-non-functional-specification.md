# 非機能仕様書（Non-Functional Specification）

## 1. パフォーマンス要件

### クライアントサイド最適化

| 項目 | 実装 |
|------|------|
| 検索デバウンス | `useDebounce` フック（300ms）により不要なAPIコールを抑制 |
| データキャッシュ | TanStack Queryによるサーバー状態のキャッシュ管理 |
| 楽観的UI更新 | TanStack Queryのキャッシュ無効化による即時反映 |
| 画像最適化 | `next/image` のunoptimizedモード（CDN側で最適化） |

### サーバーサイド

| 項目 | 実装 |
|------|------|
| BFFプロキシ | Next.js Route Handlersでバックエンドへのリクエストを中継 |
| Cookie転送 | リクエスト/レスポンスのCookieを双方向転送 |
| ストリーミング不使用 | レスポンスはテキストとして一括処理 |

## 2. スケーラビリティ

| 項目 | 仕様 |
|------|------|
| インフラ | Cloud Runによるオートスケーリング |
| コンテナポート | 8080（Cloud Run標準） |
| ステートレス設計 | セッションはバックエンドCookieで管理、フロントエンドはステートレス |
| CDN | Cloudflareによる静的アセットキャッシュ |

## 3. 可用性

| 項目 | 仕様 |
|------|------|
| デプロイ | Cloud Runのゼロダウンタイムデプロイ |
| CDN/WAF | Cloudflareによるエッジキャッシュとセキュリティ保護 |
| エラーハンドリング | 全APIコールでtry-catch + toast通知 |
| ローディング状態 | PulseLoaderによるスピナー表示 |
| データ取得エラー | エラーメッセージを画面中央に表示 |

## 4. セキュリティ（詳細は06-security-specification.mdを参照）

| 項目 | 仕様 |
|------|------|
| バックエンドURL秘匿 | BFFプロキシにより `BACKEND_API_URL` はサーバーサイドのみ |
| シークレット管理 | GCP Secret Manager経由でランタイム注入 |
| GitHub APIトークン | サーバーサイドのみで使用、クライアントに露出しない |
| リポジトリアクセス制御 | `ALLOWED_REPO_OWNER` によるホワイトリスト |
| CDN/WAF | Cloudflareによる攻撃防御 |

## 5. 保守性

### コード品質

| ツール | 用途 |
|--------|------|
| TypeScript | 静的型チェック |
| Zod | ランタイムバリデーション + 型推論 |
| ESLint 9 | 静的解析（フラットコンフィグ形式） |
| Prettier | コードフォーマット（タブ幅4、シングルクォート、末尾カンマ） |
| パスエイリアス | `@/*` → `./src/*` |

### アーキテクチャ

| 原則 | 実装 |
|------|------|
| 関心の分離 | コンポーネント / フック / API関数 / 型 / スキーマの分離 |
| 単一責任 | 各カスタムフックが特定機能を担当（useComments, useLikeBlog, useDebounce） |
| Provider分離 | QueryProvider > AuthProvider > GlobalProvider の階層構造 |
| 定数管理 | `constants.ts` にURL、メッセージ、設定値を集約 |

## 6. テスト

| 項目 | 仕様 |
|------|------|
| テストフレームワーク | Playwright |
| テスト種別 | E2E（End-to-End） |
| テスト環境 | `npm run dev` で起動したローカルサーバー |
| CI環境 | GitHub Actions上で実行、リトライ2回 |
| タイムアウト | 30秒/テスト |
| レポート | HTML形式（playwright-report/） |

## 7. デプロイ・運用

### CI/CDパイプライン

```
main ブランチへプッシュ
  → GitHub Actions
    1. E2Eテスト実行
    2. Dockerイメージビルド（マルチステージ）
    3. Artifact Registryへプッシュ
    4. Cloud Runへデプロイ
```

### Dockerイメージ

| ステージ | ベースイメージ | 用途 |
|---------|--------------|------|
| builder | node:20 | ビルド（npm ci + npm run build） |
| runner | node:20-alpine | 本番実行（軽量イメージ） |

### 環境変数管理

| 変数 | 供給元 | クライアント露出 |
|------|--------|:---:|
| `NEXT_PUBLIC_VISIT_ID_KEY` | `.env`（ビルド時） | ○ |
| `BACKEND_API_URL` | Secret Manager | × |
| `ALLOWED_REPO_OWNER` | Secret Manager | × |
| `GITHUB_TOKEN` | Secret Manager | × |

## 8. ブラウザ対応

| 項目 | 仕様 |
|------|------|
| レスポンシブデザイン | Tailwind CSSによるモバイル/タブレット/デスクトップ対応 |
| レイアウト切替 | モバイル: 縦並び、デスクトップ: サイドバー付き2カラム |
| ヘッダー | `sticky top-0` で画面上部に固定 |
