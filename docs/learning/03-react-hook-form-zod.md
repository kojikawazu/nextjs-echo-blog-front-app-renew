# React Hook Form + Zod 理解向上レポート

## 1. React Hook Form とは

React Hook Form は、Reactのフォーム管理ライブラリ。**非制御コンポーネント**（Uncontrolled Components）ベースで動作し、不要な再レンダリングを最小限に抑えながら高性能なフォームを実現する。

### 特徴

| 特徴 | 説明 |
|------|------|
| 高パフォーマンス | 非制御コンポーネントベースで再レンダリングを最小化 |
| 少ないボイラープレート | `register` 関数で入力フィールドを簡単に接続 |
| バリデーション統合 | Zod, Yup, Joi などのバリデーションライブラリと連携可能 |
| TypeScript対応 | ジェネリクスで型安全なフォーム管理 |

### 従来のパターンとの比較

```typescript
// ❌ 従来パターン（useState で各フィールドを管理）
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});

const handleSubmit = () => {
    if (!email) setErrors({ email: 'メールアドレスを入力してください' });
    // ... 手動バリデーション
};

<input value={email} onChange={(e) => setEmail(e.target.value)} />

// ✅ React Hook Form パターン
const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
});

<input {...register('email')} />
```

---

## 2. Zod とは

Zod は、TypeScriptファーストの**スキーマバリデーションライブラリ**。スキーマ定義からTypeScript型を自動推論できることが最大の特徴。

### Zod の強み

```typescript
import { z } from 'zod';

// 1. スキーマ定義（バリデーションルール）
const userSchema = z.object({
    name: z.string().min(2, '名前は2文字以上'),
    email: z.string().email('正しいメールアドレスを入力'),
    age: z.number().min(0).max(150),
});

// 2. 型推論（スキーマから自動生成）
type User = z.infer<typeof userSchema>;
// → { name: string; email: string; age: number }

// 3. バリデーション実行
const result = userSchema.safeParse({ name: 'A', email: 'invalid', age: -1 });
// result.success === false
// result.error.issues → バリデーションエラーの配列
```

**「スキーマ = 唯一の信頼源（Single Source of Truth）」**: バリデーションルールと TypeScript型が同一のスキーマから生成されるため、型とバリデーションの乖離が起きない。

---

## 3. React Hook Form + Zod の連携

### @hookform/resolvers/zod

`@hookform/resolvers` パッケージの `zodResolver` が、Zod スキーマを React Hook Form のバリデーションリゾルバに変換する。

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Zodスキーマ定義
const schema = z.object({
    email: z.string().email('正しいメールアドレスを入力'),
    password: z.string().min(6, 'パスワードは6文字以上'),
});

// 2. 型推論
type FormValues = z.infer<typeof schema>;

// 3. useForm に resolver として渡す
const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),  // ← ここで接続
});
```

### 処理フロー

```
ユーザー入力 → register('fieldName') → フォーム状態管理（React Hook Form内部）
                                              ↓
                                    handleSubmit(onSubmit) 呼び出し
                                              ↓
                                    zodResolver がバリデーション実行
                                              ↓
                              ┌─── 成功 ──→ onSubmit(data) コールバック実行
                              │
                              └─── 失敗 ──→ formState.errors にエラー格納
                                            → コンポーネント再レンダリング
                                            → エラーメッセージ表示
```

---

## 4. 本プロジェクトでの実装

### 4.1 Zod スキーマ定義

#### ログインスキーマ

**ファイル**: `src/app/schema/authSchema.ts`

```typescript
export const loginSchema = z.object({
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
```

| フィールド | バリデーション | エラーメッセージ |
|-----------|---------------|----------------|
| `email` | メールアドレス形式 | 正しいメールアドレスを入力してください |
| `password` | 6文字以上 | パスワードは6文字以上必要です |

#### 新規登録スキーマ

**ファイル**: `src/app/schema/authSchema.ts`

```typescript
export const registerSchema = z.object({
    name: z.string().min(2, '名前は2文字以上必要です'),
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
```

#### ブログ作成/編集スキーマ

**ファイル**: `src/app/schema/blogSchema.ts`

```typescript
export const blogCreateSchema = z.object({
    title: z.string().min(1, 'タイトルは1文字以上必要です').optional(),
    github_url: z.string().url('正しいURLを入力してください').optional(),
    category: z.string().min(1, 'カテゴリは1文字以上必要です').optional(),
    tags: z.string().min(1, 'タグは1文字以上必要です').optional(),
    description: z.string().min(1, '内容は1文字以上必要です').optional(),
});
export type BlogCreateFormValues = z.infer<typeof blogCreateSchema>;

// blogEditSchema も同一構造
```

> **注意点**: 全フィールドに `.optional()` が付与されており、Zodレベルでは未入力でもバリデーションが通過する。実質的な必須チェックはHTMLの `required` 属性に依存している。これは既知の課題。

#### コメントスキーマ

**ファイル**: `src/app/schema/blogCommentSchema.ts`

```typescript
export const blogCommentSchema = z.object({
    blog_id: z.string().min(1, 'ブログIDは1文字以上必要です').optional(),
    guest_user: z.string().min(1, 'ゲスト名は1文字以上必要です').optional(),
    comment: z.string().min(1, 'コメントは1文字以上必要です').optional(),
});
export type BlogCommentFormValues = z.infer<typeof blogCommentSchema>;
```

### 4.2 フォームコンポーネント

#### ログインフォーム

**ファイル**: `src/app/components/auth/login/Login.tsx`

```typescript
const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
});
```

**テンプレート部分**:

```tsx
<form onSubmit={handleSubmit((data) => signIn(data.email, data.password))}>
    {/* メールアドレス入力 */}
    <input
        id="email"
        type="email"
        {...register('email')}     // ← register で接続
        required
    />
    {errors.email && (
        <p className="text-red-500 text-sm mt-1">
            {errors.email.message}  // ← Zodのエラーメッセージを表示
        </p>
    )}

    {/* パスワード入力 */}
    <input
        id="password"
        type="password"
        {...register('password')}
        required
    />
    {errors.password && (
        <p className="text-red-500 text-sm mt-1">
            {errors.password.message}
        </p>
    )}

    <button type="submit">ログイン</button>
</form>
```

**ポイント**:
- `register('email')` は `{ onChange, onBlur, name, ref }` を返し、`<input>` にスプレッドで展開
- `handleSubmit` はバリデーション通過時のみコールバックを実行
- エラーメッセージは `errors.fieldName.message` で取得（Zodスキーマで定義したメッセージ）

#### ブログ作成フォーム（確認モーダル付き）

**ファイル**: `src/app/components/blogs/NewPost.tsx`

```typescript
const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<BlogCreateFormValues>({
    resolver: zodResolver(blogCreateSchema),
});

// 2段階の送信フロー
const handleConfirmCreate = (data: BlogCreateFormValues) => {
    setFormValues(data);                  // フォームデータを一時保存
    setIsConfirmCreateModalOpen(true);    // 確認モーダルを開く
};

const onSubmit = () => {
    if (formValues) {
        createMutation.mutate({ ...formValues });  // 実際のAPI送信
    }
    setIsConfirmCreateModalOpen(false);
};
```

**フロー図**:

```
フォーム入力
    ↓
handleSubmit(handleConfirmCreate)    ← Zodバリデーション実行
    ↓
バリデーション通過
    ↓
handleConfirmCreate(data)
    ↓
setFormValues(data) + モーダル表示
    ↓
ユーザーが「作成」ボタンをクリック
    ↓
onSubmit()
    ↓
createMutation.mutate(formValues)    ← TanStack Query ミューテーション
    ↓
API送信 → 成功: toast + リダイレクト
         → 失敗: toast エラー
```

**ポイント**: バリデーション（Zod）→ 確認（モーダル）→ 送信（TanStack Query）の3段階フローで、**バリデーションはモーダル表示前に完了**している。

#### ブログ編集フォーム

**ファイル**: `src/app/components/blogs/EditPost.tsx`

```typescript
const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<BlogEditFormValues>({
    resolver: zodResolver(blogEditSchema),
});
```

**既存データの初期値設定**:

```tsx
<input
    type="text"
    id="title"
    {...register('title')}
    defaultValue={blog?.title}    // ← 既存データを初期値として設定
/>
```

**ポイント**: `defaultValue` を使って既存ブログデータをフォームに初期表示。`useForm` の `defaultValues` オプションではなく、各 `<input>` の `defaultValue` 属性で設定している。

#### コメントフォーム

**ファイル**: `src/app/components/blogs/parts/CommentsSection.tsx`

```typescript
const { register, handleSubmit } = useForm<BlogCommentFormValues>({
    resolver: zodResolver(blogCommentSchema),
});
// 注意: formState: { errors } を取得していない → エラーメッセージ非表示
```

**ポイント**: エラーの `formState` を分割代入していないため、**バリデーションエラーメッセージがUIに表示されない**。バリデーション自体は動作するが、ユーザーへのフィードバックがない。

---

## 5. 型安全性の流れ

### スキーマから型、APIまでの型安全チェーン

```
Zodスキーマ定義 (blogSchema.ts)
    ↓ z.infer<typeof blogCreateSchema>
型定義 (BlogCreateFormValues)
    ↓ useForm<BlogCreateFormValues>
React Hook Form (型付きフォーム)
    ↓ handleSubmit(callback)
バリデーション済みデータ (data: BlogCreateFormValues)
    ↓ createMutation.mutate(data)
TanStack Query ミューテーション
    ↓ mutationFn: (data: BlogCreateFormValues) => createBlog(data)
API関数 (createBlog.ts)
    ↓ JSON.stringify({ title: data.title, ... })
バックエンドAPI
```

**全ての段階で型が一貫**しており、Zodスキーマが変更されると自動的にフォーム、ミューテーション、API関数の型も変更される。

---

## 6. 本プロジェクトの特徴と注意点

### `.optional()` 問題

ブログ・コメントスキーマで全フィールドが `.optional()` になっている:

```typescript
// 現状: optional() 付き → Zodレベルでは未入力でも通過
title: z.string().min(1, 'タイトルは1文字以上必要です').optional()

// 改善案: optional() を外す → Zodレベルで必須チェック
title: z.string().min(1, 'タイトルは1文字以上必要です')
```

`.optional()` を外すと、`z.infer` で推論される型も `string` （`string | undefined` ではなく）となり、下流の型安全性が向上する。

### `defaultValue` vs `defaultValues`

```typescript
// 現状: 各 input に defaultValue を設定
<input {...register('title')} defaultValue={blog?.title} />

// 改善案: useForm の defaultValues で一括設定
const { register } = useForm<BlogEditFormValues>({
    resolver: zodResolver(blogEditSchema),
    defaultValues: {
        title: blog?.title,
        github_url: blog?.github_url,
        // ...
    },
});
```

`defaultValues` を使うと、`reset()` 関数でフォームを初期値にリセットでき、`isDirty`（変更検知）も正しく動作する。

### エラー表示の欠落

| フォーム | エラー表示 | 備考 |
|---------|-----------|------|
| ログイン | ✅ 表示あり | `errors.email.message` で表示 |
| 新規登録 | ✅ 表示あり | 同上 |
| ブログ作成 | ✅ 表示あり | 同上 |
| ブログ編集 | ✅ 表示あり | 同上 |
| コメント | ❌ 表示なし | `formState` 未取得 |

---

## 7. データフロー図

### ログインフォームの完全なフロー

```
Login.tsx
    │
    ├─ useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
    │   ├─ register('email')     → <input> 接続
    │   ├─ register('password')  → <input> 接続
    │   └─ handleSubmit(callback)
    │
    ↓ フォーム送信
    │
Zodバリデーション (loginSchema)
    │
    ├─ 失敗 → errors.email.message / errors.password.message
    │         → <p className="text-red-500">エラーメッセージ</p>
    │
    └─ 成功 → callback(data: LoginFormValues)
              │
              ↓ signIn(data.email, data.password)
              │
        AuthContext.signIn()
              │
              ↓ loginMutation.mutateAsync({ email, password })
              │
        TanStack Query useMutation
              │
              ↓ POST /api/auth/login
              │
        Route Handler → バックエンドAPI
              │
              ├─ 成功 → toast.success('ログインしました') → ホームへ遷移
              └─ 失敗 → toast.error('メールアドレスまたはパスワードが正しくありません')
```

---

## 8. 関連ファイル一覧

| ファイル | 役割 |
|---------|------|
| `src/app/schema/authSchema.ts` | 認証フォームのZodスキーマ（login, register） |
| `src/app/schema/blogSchema.ts` | ブログフォームのZodスキーマ（create, edit） |
| `src/app/schema/blogCommentSchema.ts` | コメントフォームのZodスキーマ |
| `src/app/components/auth/login/Login.tsx` | ログインフォーム |
| `src/app/components/auth/register/Register.tsx` | 新規登録フォーム（UIのみ） |
| `src/app/components/blogs/NewPost.tsx` | ブログ作成フォーム（確認モーダル付き） |
| `src/app/components/blogs/EditPost.tsx` | ブログ編集フォーム + 削除 |
| `src/app/components/blogs/parts/CommentsSection.tsx` | コメント投稿フォーム |
| `src/app/lib/api/createBlog.ts` | ブログ作成API（型安全な送信） |
| `src/app/lib/api/updateBlogById.ts` | ブログ更新API |
| `src/app/lib/api/blog-comments/addComment.ts` | コメント追加API |
