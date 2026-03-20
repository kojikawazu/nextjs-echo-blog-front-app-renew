# TanStack Query 理解向上レポート

## 1. TanStack Query とは

TanStack Query（旧 React Query）は、Reactアプリケーションにおける**サーバー状態管理**に特化したライブラリ。従来の `useEffect` + `useState` によるデータフェッチパターンを置き換え、以下を自動化する。

| 機能 | 説明 |
|------|------|
| データフェッチ | `useQuery` でAPIコールを宣言的に記述 |
| キャッシュ管理 | キャッシュキーに基づき、同一データの再取得を防止 |
| 再検証 | ウィンドウフォーカス時・一定間隔での自動再取得 |
| ミューテーション | `useMutation` でデータ変更操作を統一管理 |
| キャッシュ無効化 | `invalidateQueries` で関連データの再取得をトリガー |

### 従来のパターンとの比較

```typescript
// ❌ 従来パターン（useEffect + useState）
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    fetch('/api/blogs')
        .then(res => res.json())
        .then(data => { setData(data); setLoading(false); })
        .catch(err => { setError(err); setLoading(false); });
}, []);

// ✅ TanStack Query パターン
const { data, isLoading, isError } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => fetchBlogs(),
});
```

TanStack Query は**ローディング状態、エラー状態、キャッシュ、再取得**をすべて内部で管理するため、ボイラープレートが大幅に削減される。

---

## 2. 本プロジェクトでの構成

### 2.1 Provider セットアップ

**ファイル**: `src/app/provider/QueryProvider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
```

**ポイント**:
- `'use client'` ディレクティブが必須（TanStack QueryはクライアントサイドのReact Contextに依存するため）
- `QueryClient` はデフォルト設定で初期化（カスタムの `defaultOptions` は未設定）
- ルートレイアウト（`src/app/layout.tsx`）で最外層のProviderとして配置

### 2.2 Provider 階層

```
QueryProvider          ← TanStack Query のコンテキスト提供
  └─ AuthProvider      ← useQuery, useMutation を使用
      └─ GlobalProvider ← fetch でデータ取得（TanStack Query 不使用）
          └─ ToastProvider + {children}
```

**設計意図**: `QueryProvider` が最外層にあるため、`AuthProvider` 内で `useQuery` / `useMutation` が使用可能。

---

## 3. useQuery の使用パターン

### 3.1 認証状態チェック

**ファイル**: `src/app/contexts/AuthContext.tsx`

```typescript
const {
    data: user,
    isLoading,
    refetch,
} = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
        const response = await fetch(COMMON_CONSTANTS.URL.AUTH_CHECK, {
            credentials: 'include',
        });
        if (!response.ok) return null;
        return response.json();
    },
    initialData: null,
});
```

| 項目 | 値 | 解説 |
|------|-----|------|
| キャッシュキー | `['authUser']` | 認証状態を一意に識別 |
| `initialData` | `null` | 初期値をnullに設定し、ローディング中もnullを返す |
| `refetch` | 関数 | ログイン/ログアウト後に手動で認証状態を再取得 |

**特徴**: ログイン/ログアウトのミューテーション成功時に `refetch()` を呼び出し、認証状態を最新化する。`invalidateQueries` ではなく `refetch` を直接使用している。

### 3.2 ブログ一覧取得

**ファイル**: `src/app/components/home/Home.tsx`

```typescript
const { data, isLoading, isError } = useQuery({
    queryKey: [
        'blogs',
        { selectedTag, selectedCategory, sortBy, currentPage, debouncedSearchQuery },
    ],
    queryFn: () =>
        fetchBlogs(
            currentPage,
            ITEMS_PER_PAGE,
            selectedTag,
            selectedCategory,
            sortBy,
            debouncedSearchQuery
        ),
    enabled: currentPage > 0,
});
```

| 項目 | 値 | 解説 |
|------|-----|------|
| キャッシュキー | `['blogs', { ...フィルタ条件 }]` | フィルタ条件ごとに個別キャッシュ |
| `enabled` | `currentPage > 0` | ページ番号が有効な場合のみクエリ実行 |
| デバウンス | `debouncedSearchQuery` | 300msのデバウンスで不要なAPIコールを抑制 |

**キャッシュキーの設計意図**: フィルタ条件をオブジェクトとしてキーに含めることで、**条件が変わると自動的に新しいクエリが発行**される。TanStack Query はキーの深い比較（deep equality）を行うため、オブジェクトでも正しく動作する。

### 3.3 ブログ詳細取得

**ファイル**: `src/app/components/blogs/BlogPost.tsx`, `src/app/components/blogs/EditPost.tsx`

```typescript
const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => fetchBlogById(id),
    enabled: !!id,
});
```

| 項目 | 値 | 解説 |
|------|-----|------|
| キャッシュキー | `['blog', id]` | ブログIDごとに個別キャッシュ |
| `enabled` | `!!id` | IDが存在する場合のみクエリ実行 |

**共有キャッシュ**: `BlogPost` と `EditPost` が同じキャッシュキーを使用するため、一度取得したデータは2つのコンポーネント間で共有される。

### 3.4 コメント一覧取得

**ファイル**: `src/app/hooks/useComments.ts`

```typescript
const { data, isLoading, isError } = useQuery({
    queryKey: ['comments', blogId],
    queryFn: () => fetchComments(blogId),
    enabled: !!blogId,
});
```

### 3.5 いいね済みブログ一覧

**ファイル**: `src/app/hooks/useLikeBlog.ts`

```typescript
const { data: likedPosts = [] } = useQuery({
    queryKey: ['likedBlogs'],
    queryFn: fetchLikedBlogs,
    enabled: true,
});
```

| 項目 | 値 | 解説 |
|------|-----|------|
| デフォルト値 | `likedPosts = []` | データ未取得時は空配列をデフォルト値として使用 |

---

## 4. useMutation の使用パターン

### 4.1 認証ミューテーション（ログイン）

**ファイル**: `src/app/contexts/AuthContext.tsx`

```typescript
const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
        const response = await fetch(COMMON_CONSTANTS.URL.LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        if (!response.ok) throw new Error(COMMON_CONSTANTS.AUTH.TOAST_LOGIN_ERROR);
        return response.json();
    },
    onSuccess: async () => {
        toast.success(COMMON_CONSTANTS.AUTH.TOAST_LOGIN_SUCCESS);
        await refetch();   // 認証状態を再取得
        router.push(COMMON_CONSTANTS.LINK.HOME);
    },
    onError: () => {
        toast.error(COMMON_CONSTANTS.AUTH.TOAST_LOGIN_ERROR);
    },
});
```

**パターン**: `mutateAsync` で呼び出し → 成功時に `refetch()` → トースト通知 → 画面遷移

### 4.2 コメント追加ミューテーション

**ファイル**: `src/app/hooks/useComments.ts`

```typescript
const addCommentMutation = useMutation({
    mutationFn: (newComment: Comment) => addComment(newComment),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
    },
});
```

**キャッシュ無効化パターン**: コメント追加成功時に `['comments', blogId]` キーのキャッシュを無効化し、コメント一覧の再取得をトリガーする。

### 4.3 いいねミューテーション

**ファイル**: `src/app/hooks/useLikeBlog.ts`

```typescript
// いいね登録
const likeMutation = useMutation({
    mutationFn: (blogId: string) => likeBlogById(blogId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
});

// いいね取消
const unlikeMutation = useMutation({
    mutationFn: (blogId: string) => unlikeBlogById(blogId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['likedBlogs'] });
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
});
```

**カスケード無効化**: いいね操作では2つのキャッシュを同時に無効化する。
1. `['likedBlogs']` — いいね済みブログIDリストを更新
2. `['blogs']` — ブログ一覧のいいね数を更新

### 4.4 ブログCRUDミューテーション

**ファイル**: `src/app/components/blogs/NewPost.tsx`, `src/app/components/blogs/EditPost.tsx`

```typescript
// 作成
const createMutation = useMutation({
    mutationFn: (createdData: BlogCreateFormValues) => createBlog(createdData),
    onSuccess: () => {
        toast.success(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_SUCCESS);
        router.push(COMMON_CONSTANTS.LINK.HOME);
    },
    onError: () => {
        toast.error(COMMON_CONSTANTS.BLOG_CREATE.TOAST_CREATE_BLOG_ERROR);
    },
});

// 更新
const updateMutation = useMutation({
    mutationFn: (updatedData: BlogEditFormValues) => updateBlogById(id, updatedData),
    onSuccess: () => {
        toast.success(COMMON_CONSTANTS.BLOG_UPDATE.TOAST_UPDATE_BLOG_SUCCESS);
        router.push(`/blog/${id}`);
    },
    onError: () => {
        toast.error(COMMON_CONSTANTS.BLOG_UPDATE.TOAST_UPDATE_BLOG_ERROR);
    },
});

// 削除
const deleteMutation = useMutation({
    mutationFn: () => deleteBlogById(id),
    onSuccess: () => {
        toast.success(COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_SUCCESS);
        router.push(COMMON_CONSTANTS.LINK.HOME);
    },
    onError: () => {
        toast.error(COMMON_CONSTANTS.BLOG_DELETE.TOAST_DELETE_BLOG_ERROR);
    },
});
```

**パターン**: 成功時にトースト通知 + 画面遷移、失敗時にエラートースト表示。

---

## 5. キャッシュキー設計

### キャッシュキー一覧

| キー | データ | 使用箇所 |
|------|--------|---------|
| `['authUser']` | 認証ユーザー情報 | `AuthContext.tsx` |
| `['blogs', { フィルタ条件 }]` | ブログ一覧 | `Home.tsx` |
| `['blog', id]` | 個別ブログ | `BlogPost.tsx`, `EditPost.tsx` |
| `['comments', blogId]` | コメント一覧 | `useComments.ts` |
| `['likedBlogs']` | いいね済みブログID配列 | `useLikeBlog.ts` |

### キー設計の原則

```
['リソース種別']                    → 単一リソース（authUser, likedBlogs）
['リソース種別', id]                → ID指定（blog, comments）
['リソース種別', { フィルタ条件 }]   → フィルタ付き一覧（blogs）
```

TanStack Query はキーを**プレフィックスマッチ**で無効化できるため、`invalidateQueries({ queryKey: ['blogs'] })` は `['blogs']` で始まる**全てのキャッシュ**を無効化する。これにより、いいね操作で全フィルタ条件のブログ一覧キャッシュが一括無効化される。

---

## 6. データフロー図

### 読み取り（useQuery）

```
コンポーネント (Home.tsx)
    │
    ↓ useQuery({ queryKey, queryFn })
    │
TanStack Query エンジン
    │
    ├─ キャッシュにデータあり → キャッシュから返却（即座）
    │                         └─ バックグラウンドで再検証（stale-while-revalidate）
    │
    └─ キャッシュにデータなし → queryFn 実行
                                │
                                ↓ fetchBlogs()
                                │
                            API関数 (lib/api/fetchBlogs.ts)
                                │
                                ↓ fetch('/api/blogs')
                                │
                            Route Handler → バックエンドAPI
                                │
                                ↓ レスポンス
                                │
                            キャッシュに保存 → コンポーネント再レンダリング
```

### 書き込み（useMutation）

```
コンポーネント (CommentsSection.tsx)
    │
    ↓ addCommentMutation.mutate(newComment)
    │
useMutation
    │
    ↓ mutationFn: addComment(newComment)
    │
API関数 (lib/api/blog-comments/addComment.ts)
    │
    ↓ fetch('/api/comments', { method: 'POST', body: ... })
    │
Route Handler → バックエンドAPI
    │
    ↓ レスポンス（成功）
    │
onSuccess コールバック
    │
    ↓ queryClient.invalidateQueries({ queryKey: ['comments', blogId] })
    │
TanStack Query エンジン
    │
    ↓ キャッシュ無効化 → 自動再取得 → コンポーネント再レンダリング
```

---

## 7. 本プロジェクトの特徴と注意点

### キャッシュ無効化の2つのパターン

| パターン | 使用箇所 | 特徴 |
|---------|---------|------|
| `invalidateQueries` | コメント、いいね | キャッシュを無効化し自動再取得をトリガー |
| `refetch()` | 認証（ログイン/ログアウト） | 特定のクエリを明示的に再取得 |

### 既知の課題

1. **ブログ作成/更新/削除後のキャッシュ無効化**: 現状、`createMutation` / `updateMutation` / `deleteMutation` の `onSuccess` で `invalidateQueries({ queryKey: ['blogs'] })` を呼んでいない。画面遷移で対処しているが、ブラウザの「戻る」で古いキャッシュが表示される可能性がある。

2. **QueryClient のデフォルト設定**: `staleTime` や `gcTime`（旧 `cacheTime`）がデフォルト値のまま。本番環境では適切な値の設定を検討すべき。

3. **エラーリトライ**: デフォルトで3回リトライが有効だが、認証エラー（401）等ではリトライが不要。`retry` オプションのカスタマイズを検討すべき。

---

## 8. 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/app/provider/QueryProvider.tsx` | Provider セットアップ |
| `src/app/contexts/AuthContext.tsx` | 認証の useQuery + useMutation |
| `src/app/components/home/Home.tsx` | ブログ一覧の useQuery |
| `src/app/components/blogs/BlogPost.tsx` | ブログ詳細の useQuery |
| `src/app/components/blogs/EditPost.tsx` | ブログ詳細の useQuery + CRUD useMutation |
| `src/app/components/blogs/NewPost.tsx` | ブログ作成の useMutation |
| `src/app/hooks/useComments.ts` | コメントの useQuery + useMutation |
| `src/app/hooks/useLikeBlog.ts` | いいねの useQuery + useMutation |
| `src/app/lib/api/*.ts` | TanStack Query から呼び出されるAPI関数群 |
