# テスト設計: ブログ系カスタムフック ユニットテスト

## 対象

- 対象機能: `components/` から切り出したブログの取得・更新フック（#130）
- 対象ファイル:
  - `src/app/hooks/useBlogs.ts`
  - `src/app/hooks/useBlog.ts`
  - `src/app/hooks/useBlogMarkdown.ts`
  - `src/app/hooks/useCreateBlog.ts`
  - `src/app/hooks/useUpdateBlog.ts`
  - `src/app/hooks/useDeleteBlog.ts`
- スタック: Next.js / TypeScript / Vitest + @testing-library/react（renderHook）
- テストファイル: `tests/hooks/{useBlogs,useBlog,useBlogMarkdown,useCreateBlog,useUpdateBlog,useDeleteBlog}.test.ts`
- モック方針: 外部 I/O である `lib/api/` の通信関数のみモックする。mutation 系は画面側の副作用であるルーター（`next/navigation`）とトースト（`react-hot-toast`）もモックし、遷移先・文言を検証する

---

## useBlogs

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 取得条件を受け渡す | page=1, limit=10, tag='go', category='tech', sortBy='popular', searchQuery='q' | `fetchBlogs(1, 10, 'go', 'tech', 'popular', 'q')` を呼び、結果を `data` で返す | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | 絞り込みなし | tag=null, category=null | `undefined` として渡す | High |
| S-2 | 無効なページ | page=0 | 取得しない・`data` は `undefined` | Medium |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | 取得失敗 | `fetchBlogs` が reject | `isError: true`・`data` は `undefined` | High |

---

## useBlog

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 記事を取得 | id='blog-1' | `fetchBlogById('blog-1')` の結果を `blog` で返す | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | ID 未指定 | id='' | 取得しない・`blog` は `undefined` | Medium |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | 取得失敗 | `fetchBlogById` が reject | `isError: true`・`blog` は `undefined` | High |

---

## useBlogMarkdown

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 本文を取得 | URL あり・`fetchMarkdown` が本文を返す | `status: 'done'`・`markdown` に本文 | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | URL なし | `undefined` | 取得しない・`{ markdown: null, status: 'idle' }` | Medium |
| S-2 | プロキシが null 返却（トークン失効・404 等） | `fetchMarkdown` が `null` | `status: 'error'`・`markdown: null` | High |
| S-3 | 古い応答の破棄 | URL_A 取得中に URL_B へ変更し、後から A が解決 | B の本文のまま（A で上書きしない） | High |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | 通信エラー | `fetchMarkdown` が reject | `status: 'error'`・`markdown: null` | High |

---

## useCreateBlog / useUpdateBlog / useDeleteBlog

3 フックとも同じ観点で検証する（遷移先・トースト文言のみ異なる）。

| フック | API | 成功トースト | 失敗トースト | 成功時の遷移先 |
|---|---|---|---|---|
| `useCreateBlog` | `createBlog(values)` | `TOAST_CREATE_BLOG_SUCCESS` | `TOAST_CREATE_BLOG_ERROR` | `/`（ホーム） |
| `useUpdateBlog(id)` | `updateBlogById(id, values)` | `TOAST_UPDATE_BLOG_SUCCESS` | `TOAST_UPDATE_BLOG_ERROR` | `/blog/:id` |
| `useDeleteBlog(id)` | `deleteBlogById(id)` | `TOAST_DELETE_BLOG_SUCCESS` | `TOAST_DELETE_BLOG_ERROR` | `/`（ホーム） |

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 成功 | API が resolve | API に引数を渡し、成功トーストを出して遷移する。失敗トーストは出さない | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | 送信中 | API が未解決のまま | `isPending` が `false` → `true` | Medium |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | API 失敗 | API が reject | 失敗トーストを出し、成功トースト・遷移はしない。`isPending` は `false` に戻る | High |
