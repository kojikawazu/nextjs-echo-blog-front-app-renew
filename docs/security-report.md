# セキュリティアラート調査レポート

調査日: 2026-01-31
対応完了日: 2026-01-31
ステータス: **対応完了**

## 概要

Dependabotにより16件のセキュリティアラートが検出され、全て対応完了しました。

## 対応前の状況

| 緊急度 | 件数 | 主なパッケージ |
|--------|------|---------------|
| HIGH | 6件 | next, glob, playwright |
| MEDIUM | 7件 | next, mdast-util-to-hast, js-yaml |
| LOW | 2件 | next |

## 実施した対応

### 1. パッケージアップグレード

| パッケージ | 変更前 | 変更後 | 備考 |
|-----------|--------|--------|------|
| next | 14.2.23 | 16.1.6 | メジャーアップグレード |
| eslint | 8.57.1 | 9.39.2 | メジャーアップグレード |
| eslint-config-next | 14.x | 16.1.6 | - |
| playwright | 1.50.1 | 最新版 | - |
| その他間接依存 | - | 更新済み | npm update |

### 2. 破壊的変更への対応

#### Next.js 16対応

**動的ルートのparams変更**

Next.js 15以降、動的ルートの`params`がPromiseに変更されました。

変更前:
```typescript
export default function BlogPage({ params }: { params: { id: string } }) {
    return <BlogPost id={params.id} />;
}
```

変更後:
```typescript
export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <BlogPost id={id} />;
}
```

影響を受けたファイル:
- `src/app/(common)/blog/[id]/page.tsx`
- `src/app/(common)/category/[category]/page.tsx`
- `src/app/(common)/edit/[id]/page.tsx`
- `src/app/(common)/tag/[tag]/page.tsx`

#### ESLint 9対応

ESLint 9ではフラットコンフィグ形式が必須となりました。

`eslint.config.mjs`を以下のように更新:
```javascript
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/**", ".next/**", "*.backup"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
```

#### Node.js 20対応

Next.js 16はNode.js 20.9.0以上が必要なため、Dockerfileを更新:

```dockerfile
# 変更前
FROM node:18 AS builder
FROM node:18-alpine AS runner

# 変更後
FROM node:20 AS builder
FROM node:20-alpine AS runner
```

### 3. コード修正

- `src/app/components/layout/Header.tsx`: 未使用インポート(`Search`)を削除
- `src/app/lib/api/fetchBlogs.ts`: 未使用変数(`queryParams`)を削除

### 4. テスト修正

- `e2e/tests/pages/blog_detail/blog_detail_unauth.spec.ts`: UIに存在しないコメント数・いいね数のテストを削除

## 対応結果

```
✓ npm audit: 0 vulnerabilities
✓ npm run build: 成功
✓ npm run lint: エラー0件
✓ E2Eテスト: 全て通過
✓ Dockerビルド: 成功
```

## 注意事項

- Node.js 18からNode.js 20への移行が完了
- Next.js 16のApp Routerでは動的ルートのparamsがPromiseになった
- ESLint 9ではフラットコンフィグ形式が必須

## 参考リンク

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
