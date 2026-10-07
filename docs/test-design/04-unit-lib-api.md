# テスト設計: API 通信関数（認証・サイドバー） ユニットテスト

## 対象

- 対象機能: Context から切り出した API アクセス層の関数（#129）
- 対象ファイル:
  - `src/app/lib/api/auth/fetchAuthUser.ts`
  - `src/app/lib/api/auth/login.ts`
  - `src/app/lib/api/auth/logout.ts`
  - `src/app/lib/api/fetchCategories.ts`
  - `src/app/lib/api/fetchTags.ts`
  - `src/app/lib/api/fetchPopularBlogs.ts`
- スタック: Next.js / TypeScript / Vitest
- テストファイル: `tests/lib/api/auth/*.test.ts` / `tests/lib/api/{fetchCategories,fetchTags,fetchPopularBlogs}.test.ts`
- モック方針: 外部 I/O である `global.fetch` のみモックし、レスポンス変換・エラー判定は実物を検証する

---

## fetchAuthUser

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 認証済みレスポンスを User に変換 | 200 + `{ user_id, username, email }` | `{ id, name, email, created_at: '', updated_at: '' }`、GET + `credentials: 'include'` で呼ぶ | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | 未認証（BFF が 200 + null に正規化） | 200 + `null` | `null` を返す（TypeError にしない） | High |
| S-2 | エラーステータス | `ok: false` | 本文を読まずに `null` を返す | High |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | ネットワーク障害 | fetch が reject | 例外を伝播 | Medium |
| E-2 | JSON パース失敗 | `json()` が throw | 例外を伝播 | Medium |

---

## login / logout

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | リクエストの組み立て | 200 | `login` は JSON ボディ + `Content-Type` で POST、`logout` は POST。いずれも `credentials: 'include'`、戻り値は `undefined` | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | エラーステータス | `ok: false` | `TOAST_LOGIN_ERROR` / `TOAST_LOGOUT_ERROR` で throw | High |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | ネットワーク障害 | fetch が reject | 例外を伝播 | Medium |

---

## fetchCategories / fetchTags / fetchPopularBlogs

### 正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| N-1 | 配列をそのまま返す | 200 + 配列 | 配列を返す。`fetchPopularBlogs(5)` は `/api/blogs/popular/5` を呼ぶ | High |

### 準正常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| S-1 | エラーステータス | `ok: false` + エラー JSON | エラー本文を返さず `FETCH_GLOBAL_DATA_ERROR` で throw（state にエラー JSON が入らない） | High |

### 異常系

| # | テストケース | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| E-1 | ネットワーク障害 | fetch が reject | 例外を伝播 | Medium |
| E-2 | JSON パース失敗 | `json()` が throw | 例外を伝播 | Medium |
