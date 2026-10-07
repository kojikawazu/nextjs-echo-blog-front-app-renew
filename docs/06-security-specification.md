# セキュリティ仕様書（Security Specification）

## 目次

- [1. 概要](#1-概要)
- [2. BFFプロキシ（バックエンドAPI秘匿化）](#2-bffプロキシバックエンドapi秘匿化)
    - [問題（対策前）](#問題対策前)
    - [対策](#対策)
    - [プロキシ実装（`src/app/api/_lib/proxy.ts`）](#プロキシ実装srcappapi_libproxyts)
- [3. 認証・認可](#3-認証認可)
    - [認証方式](#認証方式)
    - [認証状態チェック](#認証状態チェック)
    - [アクセス制御](#アクセス制御)
- [4. GitHub APIプロキシのセキュリティ](#4-github-apiプロキシのセキュリティ)
    - [脅威](#脅威)
    - [対策](#対策-1)
    - [バリデーション詳細](#バリデーション詳細)
- [5. シークレット管理](#5-シークレット管理)
    - [環境変数の分類](#環境変数の分類)
    - [Secret Manager設計原則](#secret-manager設計原則)
    - [秘匿ファイルの混入検出（Secret Scan）](#秘匿ファイルの混入検出secret-scan)
- [6. 入力バリデーション](#6-入力バリデーション)
    - [フロントエンド（Zodスキーマ）](#フロントエンドzodスキーマ)
    - [サーバーサイド（Route Handler）](#サーバーサイドroute-handler)
- [7. 通信セキュリティ](#7-通信セキュリティ)

## 1. 概要

本アプリケーションは以下のセキュリティレイヤーで保護されている:

```
ユーザー → Cloudflare (WAF/DDoS防御) → Cloud Run (Next.js BFFプロキシ) → Cloud Run (バックエンドAPI)
```

## 2. BFFプロキシ（バックエンドAPI秘匿化）

### 問題（対策前）

クライアントサイドから直接バックエンドAPIを呼び出しており、以下が全てブラウザのDevToolsで確認可能だった:

- `NEXT_PUBLIC_BACKEND_API_URL`（JSバンドルにインライン化）
- 全APIエンドポイントのURL、リクエストヘッダー、ボディ

### 対策

Next.js Route Handlersをプロキシとして導入:

```
変更前: ブラウザ → 直接fetch() → バックエンドAPI (URL丸見え)
変更後: ブラウザ → /api/* (Route Handler) → バックエンドAPI (URL非公開)
```

### プロキシ実装（`src/app/api/_lib/proxy.ts`）

| 機能 | 実装 |
|------|------|
| URLの秘匿 | `BACKEND_API_URL` はサーバーサイドの環境変数のみ |
| Cookie双方向転送 | リクエストの `Cookie` ヘッダーをバックエンドに転送、レスポンスの `Set-Cookie` をクライアントに転送 |
| Content-Type転送 | リクエスト/レスポンス双方のContent-Typeを転送 |
| ボディ転送 | GET/HEAD以外のリクエストボディを透過的に転送 |
| 204対応 | レスポンスステータス204の場合はボディなし |
| 設定チェック | `BACKEND_API_URL` 未設定時は500エラー |

## 3. 認証・認可

### 認証方式

- Cookie認証（HttpOnly Cookie）
- バックエンド（Echo + Go）がセッション管理
- フロントエンドはCookieを `credentials: 'include'` で転送

### 認証状態チェック

```
ページ読込 → GET /api/auth/check → プロキシ → バックエンド /users/auth-check
  → 認証済み: ユーザー情報返却
  → 未認証: 200 + null（コンソールエラー抑止のため）
```

### アクセス制御

| 画面 | 条件 | 動作 |
|------|------|------|
| `/new` | 未認証 | `/` へリダイレクト |
| `/edit/[id]` | 未認証 | `/login` へリダイレクト |
| `/edit/[id]` | 認証済み & 非オーナー | `/login` へリダイレクト |
| ブログ詳細の「編集」リンク | `user.id !== blog.user_id` | 非表示 |

## 4. GitHub APIプロキシのセキュリティ

### 脅威

`/api/github/markdown` が任意のGitHub URLを受け付けると、`GITHUB_TOKEN` を使ってプライベートリポジトリの内容を漏洩させる踏み台になり得る。

### 対策

| 対策 | 実装 |
|------|------|
| オーナーホワイトリスト | `ALLOWED_REPO_OWNER` 環境変数で許可オーナーを制限 |
| 不正オーナー拒否 | 許可外オーナーは403で拒否 |
| URL形式検証 | 正規表現で `https://github.com/{owner}/{repo}/blob/main/{path}.md` 形式のみ許可 |
| リクエストボディ検証 | 不正JSONや非string型のURLは400で拒否 |
| Fail-closed設計 | `GITHUB_TOKEN` があるのに `ALLOWED_REPO_OWNER` が未設定 → 500で拒否 |

### バリデーション詳細

```typescript
// URL形式チェック
const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/main\/(.+\.md)$/;

// Fail-closed: トークンはあるのにオーナー未設定
if (githubToken && !ALLOWED_OWNER) {
    return NextResponse.json({ error: 'ALLOWED_REPO_OWNER is not configured' }, { status: 500 });
}

// オーナーチェック
if (ALLOWED_OWNER && owner !== ALLOWED_OWNER) {
    return NextResponse.json({ error: 'Repository owner not allowed' }, { status: 403 });
}
```

## 5. シークレット管理

### 環境変数の分類

> 環境変数の一覧・本番の Secret Manager 構成の正準は [`../manuals/environment.md`](../manuals/environment.md)。以下は秘匿レベルの観点での再掲。

| 変数名 | 秘匿レベル | 供給元 | クライアント露出 |
|--------|-----------|--------|:---:|
| `NEXT_PUBLIC_VISIT_ID_KEY` | 低 | `.env`（ビルド時インライン化） | ○ |
| `BACKEND_API_URL` | 高 | Secret Manager | × |
| `ALLOWED_REPO_OWNER` | 中 | Secret Manager | × |
| `GITHUB_TOKEN` | 高 | Secret Manager | × |

### Secret Manager設計原則

1. **Dockerイメージにシークレットを含めない**: Artifact Registryのイメージレイヤーからの漏洩を防止
2. **Terraform stateにシークレット値を残さない**: Terraformは箱（Secret）とIAMのみ管理、値は `gcloud secrets versions add` で投入
3. **ランタイム注入**: Cloud Runの `value_from.secret_key_ref` で起動時に注入
4. **バージョン管理**: `latest` を参照し、ローテーション後は新規インスタンスから自動反映

### 秘匿ファイルの混入検出（Secret Scan）

`.gitignore` は**未追跡ファイルにしか効かない**（一度追跡されたファイル・`git add -f`・書き漏れは止められない）。また Git の履歴は追記型のため、一度 push した秘匿ファイルは追跡を外しても履歴に残り、対処は**鍵・トークンのローテーションしかない**。そこで「混入させない」`.gitignore` に加え、「**追跡された時点で落とす**」検出を CI に持たせる。

| 項目 | 内容 |
|---|---|
| 判定ロジック | `scripts/check-secret-files.sh`（唯一の定義元。CI と PR 作成前のローカル検査で共用） |
| 検査範囲 | 追跡済みファイル（`git ls-files`）+ `.gitignore` されていない未追跡ファイル（`.gitignore` 漏れの検知） |
| 検出対象 | `.env` 系（`.env` / `.env.local` / `.env.production` 等）、`*.key` / `*.pem` / `*.p12` / `*.pfx` / `*.jks` / `*.keystore`、`id_rsa` / `id_ed25519` / `id_dsa`、`credentials.json` / `serviceAccountKey.json` |
| 除外 | `*.example` / `*.sample` / `*.template` / `*.dist` / `*.env.d.ts`（テンプレート・型定義は秘匿値を含まない） |
| fail-closed | git リポジトリ外・不正な引数では終了コード 2 で失敗させる（検査できない状態を「問題なし」に倒さない） |
| CI | `.github/workflows/secret-scan.yml`。全 PR・main への push で常時実行（`paths` フィルタなし） |

> 検出はファイル名ベースであり、通常のソースに直書きされたトークン（内容）は対象外。内容の検査は PR 作成前のセルフチェック（`/pr-create`）で行う。

## 6. 入力バリデーション

### フロントエンド（Zodスキーマ）

| フォーム | バリデーション |
|---------|---------------|
| ログイン | email形式チェック、パスワード6文字以上 |
| 新規登録 | 名前2文字以上、email形式チェック、パスワード6文字以上 |
| 記事作成/編集 | Zodスキーマ上は全フィールド `optional()`。実質的な必須チェックはHTMLの `required` 属性に依存（編集画面の一部フィールドには `required` なし） |
| コメント | Zodスキーマ上は全フィールド `optional()`。必須チェックはHTMLの `required` 属性に依存 |

### サーバーサイド（Route Handler）

| エンドポイント | バリデーション |
|--------------|---------------|
| `/api/github/markdown` | JSON形式チェック、urlフィールド必須、string型チェック、URL正規表現チェック |
| その他 | プロキシ透過（バックエンドでバリデーション） |

## 7. 通信セキュリティ

| 項目 | 仕様 |
|------|------|
| HTTPS | Cloudflare → Cloud Run 間はHTTPS |
| Cookie属性 | バックエンドが設定（HttpOnly, Secure, SameSite想定） |
| credentials | 全APIリクエストで `credentials: 'include'` を指定 |
| CORS | Cloud Run / Cloudflareレベルで制御 |
