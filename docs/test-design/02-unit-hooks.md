# テスト設計: カスタムフック ユニットテスト

## 対象

- 対象機能: useDebounce / useComments / useLikeBlog
- 対象ファイル:
  - `src/app/hooks/useDebounce.ts`
  - `src/app/hooks/useComments.ts`
  - `src/app/hooks/useLikeBlog.ts`
- スタック: Next.js / TypeScript / Vitest + @testing-library/react (renderHook)
- テストファイル:
  - `src/app/hooks/__tests__/useDebounce.test.ts`
  - `src/app/hooks/__tests__/useComments.test.ts`
  - `src/app/hooks/__tests__/useLikeBlog.test.ts`

---

## useDebounce

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 初期値がそのまま返る | `useDebounce("hello", 500)` | 初期値 `"hello"` が即座に返る | High |
| N-2 | delay後に値が更新される | 値を変更後 `vi.advanceTimersByTime(500)` | 新しい値に更新される | High |
| N-3 | delay前は古い値のまま | 値を変更後 `vi.advanceTimersByTime(499)` | まだ古い値のまま | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | 連続変更でタイマーがリセットされる | 500ms以内に2回変更 | 最後の変更から500ms後に最終値が反映 | Medium |
| S-2 | アンマウント時にタイマーがクリアされる | マウント後すぐアンマウント | タイマーリークなし | Medium |

---

## useComments

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | blogIdがあればfetchCommentsが呼ばれる | `blogId = "blog-1"`, fetch モック（200 + コメント配列） | `comments` にデータが入る、`isLoading=false` | High |
| N-2 | コメント追加成功 → クエリが再フェッチされる | `addCommentMutation.mutate(comment)`, fetch モック（201） | mutate が resolve、invalidateQueries が呼ばれる | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | blogId が空文字 → fetchが呼ばれない | `blogId = ""` | `enabled=false` のため fetch 呼ばれない、`comments=[]` | High |
| S-2 | fetch が 500 → isError=true | fetch モック（500） | `isError=true` | High |

---

## useLikeBlog

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | マウント時に likedBlogs を取得する | fetchLikedBlogs モック（`["blog-1"]`） | `hasLiked("blog-1") === true` | High |
| N-2 | hasLiked で未いいね記事は false | fetchLikedBlogs モック（`["blog-1"]`） | `hasLiked("blog-2") === false` | High |
| N-3 | likeBlog → invalidateQueries が呼ばれる | likeBlogById モック（成功） | キャッシュ無効化 (`likedBlogs`, `blogs`) | High |
| N-4 | unlikeBlog → invalidateQueries が呼ばれる | unlikeBlogById モック（成功） | キャッシュ無効化 (`likedBlogs`, `blogs`) | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | likedBlogs 取得失敗 → hasLiked は false を返す | fetchLikedBlogs モック（throw） | `hasLiked` は常に `false` | Medium |

### 訪問者 ID の発行待ち（#159 回帰・`tests/hooks/useLikeBlog.visitId.test.ts`）

呼び出し順の不具合のため、`lib/api/` はモックせず `fetch` だけを偽バックエンドに差し替える。偽バックエンドは発行 API が 200 を返すまで Cookie なしとみなし、いいね一覧に 401 を返す（実バックエンドと同じ）。リトライは無効にし、401 をリトライで隠さない。

| # | 分類 | テストケース | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 正常系 | 発行の応答を保留してから解放する | 保留中はいいね一覧を取得しない。解放後に 1 回だけ取得し 200・`hasLiked` が true | High |
| S-1 | 準正常系 | 初回訪問（Cookie なし）でマウント | いいね一覧の取得は 401 を経ず 1 回で 200・`likedBlogs` は success | High |
| S-2 | 準正常系 | 発行 API が 500 | `visitId` は error・いいね一覧を取得しない・`hasLiked` は false | High |

修正前コードでの検証: 3 件とも失敗する（N-1 は保留中に一覧を取得して 401、S-1 は 401 で `likedBlogs` が error、S-2 は一覧を取得してしまう）。

---

## テスト構成

- テストランナー: Vitest + `@testing-library/react` (renderHook)
- TanStack Query ラッパー:
  ```ts
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  const createWrapper = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
  ```
- モック対象:
  - `fetch` → `vi.stubGlobal("fetch", vi.fn())`
  - `@/app/lib/api/blog-likes/*` → `vi.mock()`
  - `@/app/lib/api/blog-comments/*` → `vi.mock()`

## モック方針

- モック許可: `fetch`（HTTP通信）、API関数（外部I/O）
- モック禁止: フック内のビジネスロジック自体
