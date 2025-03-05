# Next.js + TypeScript + Echo + Go のブログWebアプリケーション(フロントエンド側)(リニューアル版)

# Summary

Zennの記事やQiitaの記事も溜まっており、GitHubに管理しているMarkdownファイルを
読み込んで表示するブログWebアプリケーション。

以下対応。

- 画面デザインの刷新
- VercelからCloud Runに移行
- Cloudflareを導入し、セキュリティ強化

## Site

以下URLで公開しています。

[該当サイト](https://techblogkk.com)

## Tech Stack

[![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prettier](https://img.shields.io/badge/-Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)](https://prettier.io/)
[![Zod](https://img.shields.io/badge/-Zod-3178C6?style=flat-square&logo=zod&logoColor=white)](https://github.com/colinhacks/zod)
[![React Hook Form](https://img.shields.io/badge/-React%20Hook%20Form-EC5990?style=flat-square&logo=react-hook-form&logoColor=white)](https://react-hook-form.com/)
[![TanStack Query](https://img.shields.io/badge/-TanStack%20Query-FF4500?style=flat-square&logo=tanstack&logoColor=white)](https://tanstack.com/query/latest/docs/framework/react/react-native/overview)
[![React Markdown](https://img.shields.io/badge/-React%20Markdown-FF4500?style=flat-square&logo=react-markdown&logoColor=white)](https://react-markdown.org/)
[![FontAwesome](https://img.shields.io/badge/-FontAwesome-339AF0?style=flat-square&logo=font-awesome&logoColor=white)](https://fontawesome.com/)
[![Cloudflare](https://img.shields.io/badge/-Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![Google Cloud Run](https://img.shields.io/badge/-Google%20Cloud%20Run-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Google Cloud Artifact Registry](https://img.shields.io/badge/-Google%20Cloud%20Artifact%20Registry-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/artifact-registry)
[![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Terraform](https://img.shields.io/badge/-Terraform-000000?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![GitHub Actions](https://img.shields.io/badge/-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Bolt](https://img.shields.io/badge/-Bolt-000000?style=flat-square&logo=bolt&logoColor=white)](https://bolt.new/)
[![Playwright](https://img.shields.io/badge/-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)

## Architecture

![Architecture](./architecture/architecture.drawio.png)

## Environment

環境変数は以下ファイルを参照してください。

[Environment](./manuals/environment.md)

## Backend Repository

バックエンド側のリポジトリは以下になります。

[バックエンドリポジトリ](https://github.com/kojikawazu/nextjs-echo-back-blog-app)

## Archived

アーカイブ用リポジトリは以下になります。

[Web側リポジトリ](https://github.com/kojikawazu/archive-nextjs-echo-front-blog-app)