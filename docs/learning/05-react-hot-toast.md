# react-hot-toast 理解向上レポート

## 1. react-hot-toast とは

react-hot-toast は、Reactアプリケーション向けの**軽量トースト通知ライブラリ**。ユーザーへの操作結果フィードバック（成功・失敗・情報）を、画面の端にポップアップ表示する。

### 特徴

| 特徴 | 説明 |
|------|------|
| 軽量 | バンドルサイズ約5KB（gzip） |
| 宣言的API | `toast.success('メッセージ')` のワンライナーで通知 |
| カスタマイズ可能 | アイコン、スタイル、位置、表示時間を変更可能 |
| Promise対応 | `toast.promise()` で非同期処理の状態を自動通知 |
| ホットリロード対応 | 開発中のリロードでも状態を維持 |

### 基本的な使い方

```typescript
import toast, { Toaster } from 'react-hot-toast';

// Provider の設置（アプリのルートに1回だけ）
function App() {
    return (
        <>
            <Toaster position="top-right" />
            <MyComponent />
        </>
    );
}

// 通知の発行（アプリ内のどこからでも）
function MyComponent() {
    const handleSave = async () => {
        try {
            await saveData();
            toast.success('保存しました');        // 成功通知
        } catch {
            toast.error('保存に失敗しました');      // エラー通知
        }
    };
}
```

### 他のライブラリとの比較

| ライブラリ | サイズ | 特徴 |
|-----------|--------|------|
| react-hot-toast | ~5KB | 軽量、シンプルAPI |
| react-toastify | ~15KB | 多機能、テーマ、進捗バー |
| notistack | ~20KB | Material-UI統合、スタック表示 |
| sonner | ~5KB | 洗練されたデザイン、新世代 |

react-hot-toast は「軽量でシンプル」を優先したチョイス。

---

## 2. 本プロジェクトでの構成

### 2.1 ToastProvider セットアップ

**ファイル**: `src/app/provider/ToastProvider.tsx`

```typescript
'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return <Toaster position="top-right" reverseOrder={false} />;
}
```

| 設定項目 | 値 | 説明 |
|---------|-----|------|
| `position` | `"top-right"` | 画面右上に表示 |
| `reverseOrder` | `false` | 通常順序（最新が上） |

**デフォルトのまま使用している設定**:
- 表示時間: 成功=2秒、エラー=4秒（デフォルト）
- アニメーション: デフォルトのスライドイン
- スタイル: デフォルト（白背景、アイコン付き）

### 2.2 Provider 階層での位置

**ファイル**: `src/app/layout.tsx`

```tsx
<QueryProvider>
    <AuthProvider>
        <GlobalProvider>
            <ToastProvider />    ← ここ
            {children}
        </GlobalProvider>
    </AuthProvider>
</QueryProvider>
```

**位置の意図**:
- `AuthProvider` より内側にあるため、`AuthContext` 内の `toast.success()` / `toast.error()` が正しく動作する
- `{children}` と同階層にあるため、全ページのコンポーネントから `toast` を呼び出せる

> **補足**: `toast.success()` / `toast.error()` は `<Toaster>` の React Context に依存**しない**。`react-hot-toast` は内部でグローバルストアを使用しており、`<Toaster>` はトーストの描画のみを担当する。そのため、Provider階層の位置に厳密な制約はない。

---

## 3. 使用パターン

### 3.1 TanStack Query ミューテーションとの統合

本プロジェクトでは、**全てのトースト通知がTanStack Queryの `useMutation` コールバック内から発行**されている。

```typescript
// パターン: useMutation の onSuccess/onError でトースト表示
const mutation = useMutation({
    mutationFn: async (data) => {
        // API呼び出し
    },
    onSuccess: () => {
        toast.success('成功メッセージ');   // ← 成功時
        router.push('/redirect-path');    // ← 画面遷移
    },
    onError: () => {
        toast.error('エラーメッセージ');    // ← 失敗時
    },
});
```

### 3.2 全トースト通知一覧

#### 認証操作

**ファイル**: `src/app/contexts/AuthContext.tsx`

| 操作 | メソッド | メッセージ | 定数キー |
|------|---------|-----------|---------|
| ログイン成功 | `toast.success` | ログインしました | `AUTH.TOAST_LOGIN_SUCCESS` |
| ログイン失敗 | `toast.error` | メールアドレスまたはパスワードが正しくありません | `AUTH.TOAST_LOGIN_ERROR` |
| ログアウト成功 | `toast.success` | ログアウトしました | `AUTH.TOAST_LOGOUT_SUCCESS` |

#### ブログ作成

**ファイル**: `src/app/components/blogs/NewPost.tsx`

| 操作 | メソッド | メッセージ | 定数キー |
|------|---------|-----------|---------|
| 作成成功 | `toast.success` | ブログを作成しました | `BLOG_CREATE.TOAST_CREATE_BLOG_SUCCESS` |
| 作成失敗 | `toast.error` | ブログの作成に失敗しました | `BLOG_CREATE.TOAST_CREATE_BLOG_ERROR` |

#### ブログ更新/削除

**ファイル**: `src/app/components/blogs/EditPost.tsx`

| 操作 | メソッド | メッセージ | 定数キー |
|------|---------|-----------|---------|
| 更新成功 | `toast.success` | ブログを更新しました | `BLOG_UPDATE.TOAST_UPDATE_BLOG_SUCCESS` |
| 更新失敗 | `toast.error` | ブログの更新に失敗しました | `BLOG_UPDATE.TOAST_UPDATE_BLOG_ERROR` |
| 削除成功 | `toast.success` | ブログを削除しました | `BLOG_DELETE.TOAST_DELETE_BLOG_SUCCESS` |
| 削除失敗 | `toast.error` | ブログの削除に失敗しました | `BLOG_DELETE.TOAST_DELETE_BLOG_ERROR` |

### 3.3 トーストが未使用の操作

以下の操作では、トースト通知が**実装されていない**:

| 操作 | 理由（推測） |
|------|------------|
| ブログ一覧取得失敗 | 画面上にエラーメッセージを直接表示 |
| ブログ詳細取得失敗 | 同上 |
| コメント投稿成功/失敗 | トースト未実装（改善候補） |
| いいね成功/失敗 | トースト未実装（改善候補） |
| 訪問者ID生成 | バックグラウンド処理のため通知不要 |

---

## 4. メッセージ定数の管理

**ファイル**: `src/app/utils/const/constants.ts`

```typescript
export const COMMON_CONSTANTS = {
    AUTH: {
        TOAST_LOGIN_SUCCESS: 'ログインしました',
        TOAST_LOGIN_ERROR: 'メールアドレスまたはパスワードが正しくありません',
        TOAST_LOGOUT_SUCCESS: 'ログアウトしました',
        TOAST_LOGOUT_ERROR: 'ログアウトに失敗しました',
    },
    BLOG_CREATE: {
        TOAST_CREATE_BLOG_SUCCESS: 'ブログを作成しました',
        TOAST_CREATE_BLOG_ERROR: 'ブログの作成に失敗しました',
    },
    BLOG_UPDATE: {
        TOAST_UPDATE_BLOG_SUCCESS: 'ブログを更新しました',
        TOAST_UPDATE_BLOG_ERROR: 'ブログの更新に失敗しました',
    },
    BLOG_DELETE: {
        TOAST_DELETE_BLOG_SUCCESS: 'ブログを削除しました',
        TOAST_DELETE_BLOG_ERROR: 'ブログの削除に失敗しました',
    },
    // ...
};
```

**設計方針**:
- 全メッセージを定数ファイルに集約
- カテゴリごとにグループ化（`AUTH`, `BLOG_CREATE`, `BLOG_UPDATE`, `BLOG_DELETE`）
- 日本語メッセージを使用
- 将来のi18n（国際化）対応がしやすい構造

---

## 5. react-hot-toast の機能紹介

### 本プロジェクトで使用中

```typescript
toast.success('成功メッセージ');   // ✅ 緑チェックマークアイコン
toast.error('エラーメッセージ');    // ❌ 赤バツアイコン
```

### 本プロジェクトで未使用だが有用な機能

#### `toast.loading` + `toast.dismiss`

```typescript
// ローディング表示
const toastId = toast.loading('保存中...');

await saveData();

// ローディング解除 → 成功表示
toast.dismiss(toastId);
toast.success('保存しました');
```

#### `toast.promise`

```typescript
// 非同期処理の状態を自動通知
toast.promise(saveData(), {
    loading: '保存中...',
    success: '保存しました',
    error: '保存に失敗しました',
});
```

本プロジェクトのTanStack Queryミューテーションと組み合わせると:

```typescript
// 改善案: toast.promise で統一的に管理
const createMutation = useMutation({
    mutationFn: (data) => {
        return toast.promise(createBlog(data), {
            loading: 'ブログを作成中...',
            success: 'ブログを作成しました',
            error: 'ブログの作成に失敗しました',
        });
    },
});
```

#### カスタムトースト

```typescript
// JSXでカスタムトーストを表示
toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-lg rounded-lg p-4`}>
        <p>カスタム通知</p>
        <button onClick={() => toast.dismiss(t.id)}>閉じる</button>
    </div>
));
```

#### オプション設定

```typescript
// 個別のトーストにオプションを指定
toast.success('保存しました', {
    duration: 5000,           // 表示時間（ms）
    icon: '🎉',               // カスタムアイコン
    style: {
        background: '#333',
        color: '#fff',
    },
});

// グローバル設定（Toasterコンポーネント）
<Toaster
    position="top-right"
    toastOptions={{
        duration: 3000,
        style: {
            background: '#363636',
            color: '#fff',
        },
        success: {
            duration: 2000,
            iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
            },
        },
        error: {
            duration: 4000,
        },
    }}
/>
```

---

## 6. データフロー図

### トースト通知の発行フロー

```
ユーザー操作（ボタンクリック等）
    ↓
React Hook Form バリデーション → 失敗: エラーメッセージ表示（トースト不使用）
    ↓ 成功
TanStack Query useMutation.mutate()
    ↓
mutationFn: API関数呼び出し
    ↓
Route Handler → バックエンドAPI
    ↓
レスポンス
    ↓
    ├─ 成功 (onSuccess)
    │   ├─ toast.success('成功メッセージ')  → Toaster コンポーネントが描画
    │   └─ router.push('/redirect-path')
    │
    └─ 失敗 (onError)
        └─ toast.error('エラーメッセージ')   → Toaster コンポーネントが描画
```

### Toaster の内部動作

```
toast.success('メッセージ')
    ↓
react-hot-toast 内部ストア（グローバル）
    ↓ ストア更新
Toaster コンポーネント（再レンダリング）
    ↓
画面右上にアニメーション付きで表示
    ↓ duration 経過
自動非表示（フェードアウト）
```

---

## 7. 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/app/provider/ToastProvider.tsx` | Toaster コンポーネントの設置 |
| `src/app/layout.tsx` | Provider階層での配置 |
| `src/app/contexts/AuthContext.tsx` | 認証操作のトースト（3箇所） |
| `src/app/components/blogs/NewPost.tsx` | ブログ作成のトースト（2箇所） |
| `src/app/components/blogs/EditPost.tsx` | ブログ更新/削除のトースト（4箇所） |
| `src/app/utils/const/constants.ts` | トーストメッセージ定数 |
