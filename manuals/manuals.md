＃ マニュアルメモ

## 追加パッケージ

```bash
npm i zustand lucide-react react-markdown
npm i --save-dev prettier eslint-config-prettier
npm i zod react-hook-form @hookform/resolvers @tanstack/react-query
npm i react-hot-toast
npm i --save-dev react-modal @types/react-modal
npm i gray-matter 
npm i remark-gfm remark-breaks rehype-raw rehype-highlight
npm i highlight.js
```

## Google Cloud 有効にしたAPI

- Artifact Registry API
- Cloud Run API
- Cloud DNS API
- Cloud DNS API

## CloudflareとCloud Runのマッピング

```bash
gcloud run domain-mappings create \
  --domain=[domain-name] \
  --service=[service-name] \
  --region=[region]
```

## テストの導入

### パッケージのインストール

```bash
# jestテスト
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest node-mocks-http\n
npm install -D @types/jest

# e2eテスト
npm install -D @playwright/test
npx playwright install
npx playwright install-deps
```

### 初期設定

### jestテスト

```bash
npx ts-jest config:init
touch jest.setup.ts
```

### e2eテスト

```bash
touch playwright.config.ts
mkdir -p e2e/tests
```