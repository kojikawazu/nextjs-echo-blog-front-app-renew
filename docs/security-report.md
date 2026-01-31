# セキュリティアラート調査レポート

調査日: 2026-01-31
対応完了日: 2026-01-31
ステータス: **対応完了**

## 概要

Dependabotにより16件のセキュリティアラートが検出されています（1件は自動却下済み）。

## 対応が必要なアラート

### 緊急度: HIGH（要対応）

| # | パッケージ | 現在バージョン | 修正バージョン | 脆弱性概要 |
|---|-----------|--------------|---------------|-----------|
| 23, 21 | next | 14.2.23 | 15.0.8 | HTTP request deserialization によるDoS（React Server Components使用時） |
| 19 | next | 14.2.23 | 14.2.35 | Server Components DoS（不完全な修正のフォローアップ） |
| 18 | next | 14.2.23 | 14.2.34 | Server Components DoS |
| 16 | glob | 10.4.5 | 10.5.0 | CLI -c/--cmd オプション経由のコマンドインジェクション |
| 10 | playwright | 1.50.1 | 1.55.1 | ブラウザダウンロード時のSSL証明書検証なし |

### 緊急度: MEDIUM（推奨対応）

| # | パッケージ | 現在バージョン | 修正バージョン | 脆弱性概要 |
|---|-----------|--------------|---------------|-----------|
| 22, 20 | next | 14.2.23 | 15.5.10 | Image Optimizer remotePatterns設定によるDoS |
| 17 | mdast-util-to-hast | 13.2.0 | 13.2.1 | class属性のサニタイズ漏れ |
| 14, 13 | js-yaml | 4.1.0 | 4.1.1 | merge (<<) によるプロトタイプ汚染 |
| 8 | next | 14.2.23 | 14.2.32 | Middleware Redirect処理によるSSRF |
| 7, 6 | next | 14.2.23 | 14.2.31 | Image Optimization関連の脆弱性 |

### 緊急度: LOW（任意対応）

| # | パッケージ | 現在バージョン | 修正バージョン | 脆弱性概要 |
|---|-----------|--------------|---------------|-----------|
| 9 | next | 14.2.23 | 14.2.24 | Race Condition によるキャッシュ汚染 |
| 2 | next | 14.2.23 | 14.2.30 | 開発サーバーのオリジン検証漏れによる情報漏洩 |

## 対応要否判定

### 1. Next.js（対応必須）

**現在**: 14.2.23
**推奨**: 14.2.35以上（最低限）または 15.x系へメジャーアップグレード

**理由**:
- 複数のHIGH脆弱性が存在
- Server Components DoS (GHSA-mwv6-3258-q52c, GHSA-5j59-xgg2-r9c4) は本番環境に影響
- 14.2.35で主要な脆弱性が修正される

**対応案**:
```bash
# 最低限の対応（14.x系を維持）
npm install next@14.2.35

# 完全対応（15.x系へアップグレード）
npm install next@15
```

**注意**: 15.x系へのアップグレードには破壊的変更の確認が必要

### 2. Playwright（対応推奨）

**現在**: 1.50.1
**推奨**: 1.55.1以上

**理由**:
- SSL証明書検証なしでブラウザをダウンロード
- 開発依存のため本番環境への直接影響は低いが、開発環境のセキュリティリスク

**対応案**:
```bash
npm install -D playwright@1.55.1
npx playwright install
```

### 3. glob（対応推奨）

**現在**: 10.4.5
**推奨**: 10.5.0以上

**理由**:
- コマンドインジェクション脆弱性
- 開発依存（rimrafの依存）のため影響は限定的

**対応案**:
```bash
npm update glob
```

### 4. js-yaml（対応推奨）

**現在**: 4.1.0
**推奨**: 4.1.1以上

**理由**:
- プロトタイプ汚染脆弱性
- gray-matterの依存として使用されている

**対応案**:
```bash
npm update js-yaml
```

### 5. mdast-util-to-hast（対応推奨）

**現在**: 13.2.0
**推奨**: 13.2.1以上

**理由**:
- class属性のサニタイズ漏れ
- react-markdownの依存として使用

**対応案**:
```bash
npm update mdast-util-to-hast
```

## 優先度別対応計画

### Phase 1: 緊急対応（即時）
1. Next.js を 14.2.35 にアップグレード
   - Server Components DoS脆弱性の修正

### Phase 2: 推奨対応（1週間以内）
1. Playwright を 1.55.1 にアップグレード
2. `npm update` で間接依存を更新
   - glob, js-yaml, mdast-util-to-hast

### Phase 3: 計画対応（1ヶ月以内）
1. Next.js 15.x系へのメジャーアップグレード検討
   - 破壊的変更の調査
   - テスト計画の策定

## 対応コマンド

```bash
# Phase 1: Next.js更新
npm install next@14.2.35

# Phase 2: 開発依存更新
npm install -D playwright@latest
npm update

# 更新後の確認
npm audit
npm run build
npm run test:e2e
```

## 注意事項

- アップグレード後は必ず `npm run build` と `npm run test:e2e` で動作確認を行うこと
- Next.js 15.xへのアップグレードは破壊的変更があるため、別途調査が必要
- 本番デプロイ前にステージング環境でのテストを推奨
