# Zustand 理解向上レポート

## 1. Zustand とは

Zustand（ドイツ語で「状態」の意）は、Reactのための**軽量な状態管理ライブラリ**。Reduxに比べてボイラープレートが圧倒的に少なく、シンプルなAPIでグローバル状態を管理できる。

### 特徴

| 特徴 | 説明 |
|------|------|
| 軽量 | バンドルサイズ約1KB（gzip） |
| Providerレス | React Contextの `<Provider>` ラッパー不要 |
| 直感的API | `create` 関数で状態とアクションを定義 |
| React外でも使用可 | Vanillaストアとしても動作 |
| 不変性不要 | Immerなしでも直接的な状態更新が可能 |

### 基本的な使い方

```typescript
import { create } from 'zustand';

// ストア定義
interface CounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// コンポーネントでの使用
function Counter() {
    const { count, increment } = useCounterStore();
    return <button onClick={increment}>{count}</button>;
}
```

### Redux との比較

```typescript
// ❌ Redux パターン（ボイラープレートが多い）
// 1. Action Types 定義
// 2. Action Creators 定義
// 3. Reducer 定義
// 4. Store 作成
// 5. Provider 設置
// 6. useSelector + useDispatch で接続

// ✅ Zustand パターン（全て1ファイルで完結）
const useStore = create((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

---

## 2. 本プロジェクトでの位置づけ

### 重要な事実: Zustand は定義のみで本番未使用

本プロジェクトでは、Zustand ストアは**開発初期のサンプルデータ用として定義**されているが、**実際のコンポーネントからはインポートされていない**。本番の状態管理は以下の構成で行われている。

| 状態の種類 | 本番で使用 | Zustand ストア（未使用） |
|-----------|-----------|----------------------|
| サーバー状態 | **TanStack Query** | `blogStores.ts`, `commentStores.ts` |
| 認証状態 | **React Context** (`AuthContext`) | `authStores.ts` |
| グローバルUI状態 | **React Context** (`GlobalContext`) | — |
| ローカルUI状態 | **useState** | — |

### なぜ本番で使われていないのか

1. **バックエンドAPIが存在する**: Zustand はクライアントサイドのローカル状態管理に適しているが、本プロジェクトはバックエンドAPIからデータを取得するため、**サーバー状態管理**に特化した TanStack Query が適している
2. **開発段階の変遷**: 開発初期にZustandでモックデータを管理し、バックエンドAPI連携後に TanStack Query + React Context に移行したと推測される
3. **依存関係は残存**: `package.json` に `zustand: ^5.0.3` が残っている（未使用だが削除されていない）

---

## 3. 定義されているストア

### 3.1 認証ストア（authStores.ts）

**ファイル**: `src/app/stores/authStores.ts`

```typescript
interface AuthState {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => void;
    initialize: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    signIn: async (email, password) => {
        // ハードコードされたサンプルユーザーと照合
        if (email === sampleUser.email && password === 'password') {
            set({ user: sampleUser });
        }
    },
    signUp: async (email, password, name) => {
        // ランダムIDでモックユーザーを生成
        const newUser = { id: Math.random().toString(), name, email, ... };
        set({ user: newUser });
    },
    signOut: () => set({ user: null, loading: false }),
    initialize: () => { /* no-op */ },
}));
```

**本番の代替**: `AuthContext.tsx` が TanStack Query の `useQuery` / `useMutation` を使って同等の機能を提供。

### 3.2 ブログストア（blogStores.ts）

**ファイル**: `src/app/stores/blogStores.ts`

```typescript
interface BlogState {
    blogs: Blog[];
    filteredBlogs: Blog[];
    totalPages: number;
    currentPage: number;
    loading: boolean;
    searchQuery: string;
    selectedCategory: string | null;
    selectedTag: string | null;
    sortBy: 'newest' | 'popular';
    // 11個のアクションメソッド
    fetchBlogs: (page: number, limit: number, ...) => void;
    createBlog: (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) => void;
    updateBlog: (id: string, blog: Partial<Blog>) => void;
    deleteBlog: (id: string) => void;
    likeBlog: (id: string) => void;
    unlikeBlog: (id: string) => void;
    hasLiked: (id: string) => boolean;
    // ... フィルタ・ソート setters
}
```

**特徴**:
- 12件のハードコードされたサンプルブログデータを内蔵
- クライアントサイドでフィルタリング、検索、ソート、ページネーションを実装
- `localStorage` を使った「いいね」の永続化（`techblog_liked_posts` キー）

**本番の代替**: `Home.tsx` の `useQuery` + `fetchBlogs()` API関数

### 3.3 コメントストア（commentStores.ts）

**ファイル**: `src/app/stores/commentStores.ts`

```typescript
interface CommentState {
    comments: Comment[];
    totalPages: number;
    currentPage: number;
    loading: boolean;
    fetchComments: (blogId: string, page: number, limit: number) => void;
    addComment: (comment: Omit<Comment, 'id' | 'created_at'>) => void;
}
```

**特徴**:
- 2件のサンプルコメントデータ
- `parent_id` をサポートしたリプライ構造のモックデータ

**本番の代替**: `useComments` フック（TanStack Query）

---

## 4. Zustand の学習ポイント

### 4.1 `create` 関数と `set` 関数

```typescript
const useStore = create<State>((set, get) => ({
    // 状態
    count: 0,

    // set: 状態を更新（マージされる）
    increment: () => set((state) => ({ count: state.count + 1 })),

    // get: 現在の状態を読み取り
    getDouble: () => get().count * 2,
}));
```

- `set` はオブジェクトの**浅いマージ**を行う（スプレッド不要）
- `get` で現在の状態を同期的に読み取れる

### 4.2 セレクタパターン

```typescript
// ❌ ストア全体を取得（不要な再レンダリングが発生）
const { count, name, email } = useStore();

// ✅ 必要なフィールドのみ取得（パフォーマンス最適化）
const count = useStore((state) => state.count);
```

セレクタを使うと、選択したフィールドが変更された場合のみコンポーネントが再レンダリングされる。

### 4.3 ミドルウェア

Zustand は `persist`、`devtools`、`immer` などのミドルウェアをサポートする。

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// localStorage に自動永続化
const useStore = create(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),
        }),
        { name: 'theme-storage' }
    )
);
```

本プロジェクトの `blogStores.ts` では `persist` ミドルウェアを使わず、手動で `localStorage` を操作している。

---

## 5. TanStack Query vs Zustand: 使い分けの指針

### 本プロジェクトから学べる判断基準

| 判断基準 | TanStack Query が適切 | Zustand が適切 |
|---------|---------------------|---------------|
| データの出所 | サーバー（API） | クライアントのみ |
| キャッシュが必要か | はい | 不要 |
| 楽観的更新が必要か | はい（`invalidateQueries`） | 不要 |
| 複数コンポーネントで共有 | はい（キャッシュで自動共有） | はい（グローバルストアで共有） |
| ローカルUI状態 | 不適切 | 最適 |

### 本プロジェクトでZustandが活きるケース

もし今後以下のような機能が追加されれば、Zustand の出番がある:

1. **ダークモード切替**: サーバーに保存不要なUI設定
2. **サイドバー開閉状態**: レイアウトのUI状態
3. **フォームの下書き保存**: `persist` ミドルウェアで localStorage に自動保存
4. **ブログエディタの一時状態**: 複数コンポーネント間で共有するエディタ状態

---

## 6. 関連ファイル一覧

| ファイル | 状態 | 役割 |
|---------|------|------|
| `src/app/stores/authStores.ts` | 未使用 | サンプル認証ストア |
| `src/app/stores/blogStores.ts` | 未使用 | サンプルブログストア（12件のモックデータ） |
| `src/app/stores/commentStores.ts` | 未使用 | サンプルコメントストア |
| `src/app/contexts/AuthContext.tsx` | 本番使用 | 認証状態（TanStack Query ベース） |
| `src/app/contexts/GlobalContext.tsx` | 本番使用 | グローバルデータ（React Context） |
| `src/app/hooks/useComments.ts` | 本番使用 | コメント管理（TanStack Query ベース） |
| `src/app/hooks/useLikeBlog.ts` | 本番使用 | いいね管理（TanStack Query ベース） |
