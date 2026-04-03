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
