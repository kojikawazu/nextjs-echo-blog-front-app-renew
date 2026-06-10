# セキュリティ修正レポート: バックエンドAPI露出対策

## 目次

- [問題](#問題)
    - [露出していたエンドポイント](#露出していたエンドポイント)
- [対策](#対策)
    - [1. BFFプロキシ（Route Handlers）の導入](#1-bffプロキシroute-handlersの導入)
    - [2. GitHubプロキシのセキュリティ強化](#2-githubプロキシのセキュリティ強化)
    - [3. 環境変数・シークレット管理の刷新](#3-環境変数シークレット管理の刷新)
    - [4. E2Eモックの追従](#4-e2eモックの追従)
    - [5. CI/CD・Terraform・ドキュメント更新](#5-cicdterraformドキュメント更新)
- [新規環境の初回構築手順](#新規環境の初回構築手順)
- [既存環境の設定変更手順（gcloud）](#既存環境の設定変更手順gcloud)
- [検証結果](#検証結果)
- [注意事項](#注意事項)

対応日: 2026-03-19
ステータス: **対応完了**
Issue: https://github.com/kojikawazu/nextjs-echo-blog-front-app-renew/issues/49
ブランチ: `fix/proxy-backend-api`

## 問題

クライアントサイドから直接バックエンドAPIを呼び出しており、以下が全てブラウザのDevToolsで確認可能だった。

- `NEXT_PUBLIC_BACKEND_API_URL`（JSバンドルにインライン化）
- 全APIエンドポイントのURL・リクエストヘッダー・ボディ

### 露出していたエンドポイント

| カテゴリ | エンドポイント | リスク |
|---------|--------------|--------|
| 認証 | `/users/login`, `/logout`, `/auth-check` | 認証URLが丸見え |
| ブログCRUD | `/blogs`, `/blogs/create`, `/update/:id`, `/delete/:id` | 全CRUD操作が直接実行可能 |
| いいね | `/blog-likes/create/:id`, `/delete/:id` | visitor ID偽装可能 |
| コメント | `/comments/blog/:id`, `/comments/create` | なりすまし投稿可能 |
| グローバルデータ | `/blogs/categories`, `/tags`, `/popular/:count` | データスクレイピング可能 |

## 対策

### 1. BFFプロキシ（Route Handlers）の導入

Next.js Route Handlers をプロキシとして導入し、バックエンドURLをサーバーサイドに隔離。

```
変更前: ブラウザ → 直接fetch() → バックエンドAPI (URL丸見え)
変更後: ブラウザ → /api/* (Next.js Route Handler) → バックエンドAPI (URL非公開)
```

#### 新規作成ファイル

| ファイル | 役割 |
|---------|------|
| `src/app/api/_lib/proxy.ts` | プロキシヘルパー（Cookie双方向転送対応） |
| `src/app/api/auth/login/route.ts` | POST → `/users/login` |
| `src/app/api/auth/logout/route.ts` | POST → `/users/logout` |
| `src/app/api/auth/check/route.ts` | GET → `/users/auth-check` |
| `src/app/api/blogs/route.ts` | GET → `/blogs`, POST → `/blogs/create` |
| `src/app/api/blogs/[id]/route.ts` | GET/PUT/DELETE → `/blogs/detail\|update\|delete/:id` |
| `src/app/api/blogs/categories/route.ts` | GET → `/blogs/categories` |
| `src/app/api/blogs/tags/route.ts` | GET → `/blogs/tags` |
| `src/app/api/blogs/popular/[count]/route.ts` | GET → `/blogs/popular/:count` |
| `src/app/api/blog-likes/route.ts` | GET → `/blog-likes` |
| `src/app/api/blog-likes/generate-visit-id/route.ts` | GET → `/blog-likes/generate-visit-id` |
| `src/app/api/blog-likes/[blogId]/route.ts` | POST/DELETE → `/blog-likes/create\|delete/:blogId` |
| `src/app/api/comments/route.ts` | POST → `/comments/create` |
| `src/app/api/comments/[blogId]/route.ts` | GET → `/comments/blog/:blogId` |
| `src/app/api/github/markdown/route.ts` | GitHub Markdown取得プロキシ |

#### クライアントAPI層の修正

- `constants.ts`: `API_URL` プロパティ削除、全URLを `/api/*` 内部ルートに変更
- `lib/api/` 全12ファイル: fetch先を `COMMON_CONSTANTS.API_URL + ...` から `COMMON_CONSTANTS.URL.*` に変更
- `AuthContext.tsx`, `GlobalContext.tsx`: 同上

### 2. GitHubプロキシのセキュリティ強化

`/api/github/markdown` が任意のGitHub URLを受け付けると、`GITHUB_TOKEN` を使ってプライベートリポジトリの内容を漏洩させる踏み台になり得る。

#### 対策

- `ALLOWED_REPO_OWNER` 環境変数によるオーナーホワイトリスト
- 許可外オーナーへのリクエストは 403 で拒否
- リクエストボディの型チェック（不正JSONや非string型は 400）
- fail-closed 設計: `GITHUB_TOKEN` があるのに `ALLOWED_REPO_OWNER` が未設定の場合は 500 で拒否（設定漏れ時の保護）

```typescript
// GITHUB_TOKEN があるのに ALLOWED_REPO_OWNER が未設定 → fail-closed
if (githubToken && !ALLOWED_OWNER) {
    return NextResponse.json({ error: 'ALLOWED_REPO_OWNER is not configured' }, { status: 500 });
}

// 許可されたオーナーのリポジトリのみアクセス可能
if (ALLOWED_OWNER && owner !== ALLOWED_OWNER) {
    return NextResponse.json({ error: 'Repository owner not allowed' }, { status: 403 });
}
```

### 3. 環境変数・シークレット管理の刷新

#### 環境変数の変更

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| `NEXT_PUBLIC_BACKEND_API_URL` | `BACKEND_API_URL` | `NEXT_PUBLIC_` を外しサーバー専用に |
| (なし) | `ALLOWED_REPO_OWNER` | GitHubプロキシのオーナー制限 |
| (なし) | `GITHUB_TOKEN` | 明示的にランタイム注入経路を定義 |

#### 本番環境（Cloud Run）の構成

| 変数名 | 供給元 | Docker `.env` |
|--------|--------|:---:|
| `NEXT_PUBLIC_VISIT_ID_KEY` | 平文 env var | ✅ ビルド時必要 |
| `BACKEND_API_URL` | Secret Manager (`backend-api-url`) | ❌ |
| `ALLOWED_REPO_OWNER` | Secret Manager (`allowed-repo-owner`) | ❌ |
| `GITHUB_TOKEN` | Secret Manager (`github-token`) | ❌ |

#### シークレットをDockerイメージに含めない理由

デプロイworkflowで `.env` にシークレットを書き出すと、Dockerイメージのレイヤーに焼き込まれる。Artifact Registryのイメージにアクセスできる人がトークンを取り出せるため、ランタイム環境変数（Secret Manager）で注入する構成に変更。

#### Terraform stateにシークレット値を残さない理由

`google_secret_manager_secret_version` で `secret_data = var.github_token` とすると、`sensitive = true` でも state に平文で残る。Terraform は箱（Secret）と IAM のみ管理し、値の投入は `gcloud secrets versions add` で実施。

### 4. E2Eモックの追従

API パスが `/api/*` に変更されたため、Playwright のモックも全て更新。

| ファイル | 変更内容 |
|---------|---------|
| `auth-api-mock.ts` | `**/users/*` → `**/api/auth/*` |
| `blog-api-mock.ts` | `**/blogs/*` → `**/api/blogs/*` + メソッドチェック追加 |
| `blog-comment-api-mock.ts` | パス更新 + メソッドチェック追加 |
| `blog_detail_unauth.spec.ts` | `https://api.github.com/**` → `**/api/github/markdown`（JSON形式） |
| `blog_detail_comment_unauth.spec.ts` | 同上 |

### 5. CI/CD・Terraform・ドキュメント更新

| ファイル | 変更内容 |
|---------|---------|
| `deploy_to_googlecloud.yml` | `.env` に `NEXT_PUBLIC_VISIT_ID_KEY` のみ書出 |
| `test.yml` | `.env.test` にテスト用環境変数を書出 |
| `terraform/secret_manager.tf` | Secret Manager リソース（箱 + IAM）を定義 |
| `terraform/cloud_run.tf` | 全シークレットを `value_from.secret_key_ref` に変更 |
| `terraform/variables.tf` | シークレット関連の変数を削除 |
| `manuals/environment.md` | Secret Manager 運用手順を記載 |
| `CLAUDE.md` | 環境変数セクション更新 |

## 新規環境の初回構築手順

```bash
# ステップ1: Secret Manager の箱と IAM を作成
terraform apply \
  -target=google_secret_manager_secret.backend_api_url \
  -target=google_secret_manager_secret.allowed_repo_owner \
  -target=google_secret_manager_secret.github_token \
  -target=google_secret_manager_secret_iam_member.backend_api_url_access \
  -target=google_secret_manager_secret_iam_member.allowed_repo_owner_access \
  -target=google_secret_manager_secret_iam_member.github_token_access

# ステップ2: シークレット値を投入
gcloud secrets versions add backend-api-url --data-file=- <<< "<バックエンドURL>"
gcloud secrets versions add allowed-repo-owner --data-file=- <<< "kojikawazu"
gcloud secrets versions add github-token --data-file=- <<< "ghp_xxxxx"

# ステップ3: 残りのリソース（Cloud Run 含む）を作成
terraform apply
```

## 既存環境の設定変更手順（gcloud）

```bash
SERVICE_NAME="<Cloud Runサービス名>"
REGION="<リージョン>"
SA_EMAIL="<Cloud Runサービスアカウントのメール>"

# 1. 旧環境変数を削除し Secret Manager 参照に置換
gcloud run services update $SERVICE_NAME --region $REGION \
  --remove-env-vars NEXT_PUBLIC_BACKEND_API_URL

# 2. Secret Manager にシークレットを作成・投入
gcloud secrets create backend-api-url --replication-policy="automatic"
gcloud secrets create allowed-repo-owner --replication-policy="automatic"
gcloud secrets create github-token --replication-policy="automatic"

gcloud secrets versions add backend-api-url --data-file=- <<< "<バックエンドURL>"
gcloud secrets versions add allowed-repo-owner --data-file=- <<< "kojikawazu"
gcloud secrets versions add github-token --data-file=- <<< "ghp_xxxxx"

# 3. IAM 権限付与
gcloud secrets add-iam-policy-binding backend-api-url --member="serviceAccount:${SA_EMAIL}" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding allowed-repo-owner --member="serviceAccount:${SA_EMAIL}" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding github-token --member="serviceAccount:${SA_EMAIL}" --role="roles/secretmanager.secretAccessor"

# 4. Cloud Run に Secret Manager 参照を設定（--update-secrets で既存を維持）
gcloud run services update $SERVICE_NAME --region $REGION \
  --update-secrets BACKEND_API_URL=backend-api-url:latest,ALLOWED_REPO_OWNER=allowed-repo-owner:latest,GITHUB_TOKEN=github-token:latest

# 5. GitHub Secrets 更新（次回 CI/CD デプロイ用）
gh secret delete NEXT_PUBLIC_BACKEND_API_URL
gh secret set BACKEND_API_URL
gh secret set ALLOWED_REPO_OWNER
```

## 検証結果

```
✓ npm run build: 成功（全16 Route Handler認識済み）
✓ npx eslint: エラー0件
✓ Cloud Run: Secret Manager参照での起動確認済み
```

## 注意事項

- `gcloud run services update` で `--set-secrets` を使うと既存のシークレット参照が全置換される。追加・更新時は `--update-secrets` を使用すること
- `gcloud run deploy`（CI/CD）は `--set-secrets` を指定していないため、既存のシークレット参照は維持される
- Secret Manager は `latest` バージョンを参照。ローテーション後は新規インスタンスから自動反映
