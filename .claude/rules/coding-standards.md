---
description: コーディング規約
globs: 
---

# コーディング規約

- **言語**: TypeScript strict モード（`strict: true`）
- **パッケージマネージャ**: pnpm を使用（npm, yarn は使用しない）
- **Linter / Formatter**: ESLint + Prettier でコード品質を担保
- **環境変数**: 設定値は環境変数で管理（`apps/front/.env`）
- **シークレット禁止**: シークレット・認証情報をハードコードしない

## Prettier 設定

| 項目 | 設定値 |
|------|--------|
| タブ幅 | 4スペース |
| クォート | シングルクォート |
| 末尾カンマ | あり（`trailingComma: all`） |
| セミコロン | あり |
| 行幅 | 100 |

## パスエイリアス

- `@/*` で `apps/front/src/*` を参照する（`apps/front/tsconfig.json` 基準）。相対パスの深いネストを避ける。

詳細仕様は `docs/10-miscellaneous-specification.md` を参照。
