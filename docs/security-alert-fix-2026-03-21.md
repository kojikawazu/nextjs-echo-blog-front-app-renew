# セキュリティアラート対応レポート

## 目次

- [概要](#概要)
- [対応前の状況](#対応前の状況)
- [アラート詳細](#アラート詳細)
    - [next（5件）→ 16.1.6 → 16.2.1](#next5件-1616--1621)
    - [minimatch（2件）→ 3.1.2 → 3.1.5 / 9.0.5 → 9.0.9](#minimatch2件-312--315--905--909)
- [実施した対応](#実施した対応)
    - [1. `npm audit fix` の実行](#1-npm-audit-fix-の実行)
    - [2. パッケージバージョン変更](#2-パッケージバージョン変更)
- [対応結果](#対応結果)
- [注意事項](#注意事項)
    - [`next lint` コマンドの仕様変更](#next-lint-コマンドの仕様変更)

調査日: 2026-03-21
対応完了日: 2026-03-21
ステータス: **対応完了**

## 概要

Dependabotにより7件のセキュリティアラートが検出され、`npm audit fix` で全て対応完了しました。

## 対応前の状況

| 緊急度 | 件数 | パッケージ |
|--------|------|-----------|
| HIGH | 2件 | minimatch |
| MEDIUM | 4件 | next |
| LOW | 1件 | next |

## アラート詳細

### next（5件）→ 16.1.6 → 16.2.1

| # | 緊急度 | 脆弱性 | 修正バージョン |
|---|--------|--------|--------------|
| 39 | medium | Unbounded next/image disk cache growth can exhaust storage | 16.1.7 |
| 37 | medium | HTTP request smuggling in rewrites | 16.1.7 |
| 36 | medium | Unbounded postponed resume buffering can lead to DoS | 16.1.7 |
| 35 | medium | null origin can bypass Server Actions CSRF checks | 16.1.7 |
| 34 | low | null origin can bypass dev HMR websocket CSRF checks | 16.1.7 |

### minimatch（2件）→ 3.1.2 → 3.1.5 / 9.0.5 → 9.0.9

| # | 緊急度 | 脆弱性 | 修正バージョン |
|---|--------|--------|--------------|
| 32 | high | ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments (`< 3.1.3`) | 3.1.3 |
| 29 | high | ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments (`9.0.0-9.0.6`) | 9.0.7 |

## 実施した対応

### 1. `npm audit fix` の実行

```bash
npm audit fix
# changed 7 packages, and audited 524 packages
# found 0 vulnerabilities
```

### 2. パッケージバージョン変更

| パッケージ | 変更前 | 変更後 | 備考 |
|-----------|--------|--------|------|
| next | 16.1.6 | 16.2.1 | メジャーバージョン内アップグレード |
| minimatch | 3.1.2 | 3.1.5 | 間接依存（eslint系経由） |
| minimatch | 9.0.5 | 9.0.9 | 間接依存（@typescript-eslint/typescript-estree経由） |

## 対応結果

```
✓ npm audit: 0 vulnerabilities
✓ npm run build: 成功（Next.js 16.2.1、全Route Handler認識済み）
✓ npx eslint .: エラー0件（既存warning 2件のみ）
```

## 注意事項

### `next lint` コマンドの仕様変更

Next.js 16.2.1 で `next lint` サブコマンドの仕様が変更され、`npm run lint`（= `next lint`）が正常に動作しなくなった。直接 `npx eslint .` を実行することで問題なくリントチェック可能。必要に応じて `package.json` の `lint` スクリプトを `eslint .` に変更する対応を検討。
