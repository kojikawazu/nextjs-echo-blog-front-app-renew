# Stage 1: Build（build context = リポジトリルート。pnpm ワークスペース対応）
FROM node:20 AS builder

WORKDIR /app

# pnpm はバージョン固定（pnpm@latest は Node 22+ 要求の 11.x を引き、node:20 ベースで
# ERR_UNKNOWN_BUILTIN_MODULE(node:sqlite) クラッシュするため）。CI(test.yml)と同じ 10.33.0 に揃える。
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# 依存解決に必要な manifest を先に COPY してレイヤキャッシュを効かせる。
# pnpm-workspace.yaml の onlyBuiltDependencies も install 時に効かせるため一緒に COPY する
# （未COPY だと sharp / unrs-resolver のビルドが ERR_PNPM_IGNORED_BUILDS で失敗する）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/front/package.json ./apps/front/
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter front build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app/apps/front

# pnpm の仮想ストア(.pnpm)はルート node_modules に集約され、apps/front/node_modules は
# そこへの相対シンボリックリンク（.bin/next 含む）。両方を構造を保って COPY する必要がある。
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/front/node_modules ./node_modules
COPY --from=builder /app/apps/front/package.json ./package.json
COPY --from=builder /app/apps/front/.next ./.next
COPY --from=builder /app/apps/front/public ./public
COPY --from=builder /app/apps/front/.env ./.env

ENV PORT=8080
EXPOSE 8080

# apps/front/node_modules/.bin/next → ルート .pnpm ストアへ解決される
CMD ["node_modules/.bin/next", "start"]
