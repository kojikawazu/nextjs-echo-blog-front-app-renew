# テスト設計: いいね解除後の表示不整合（#17）

## 対象

- 不具合: 最後のいいねを解除しても、いいね済み表示（青）のまま残る
- 原因: バックエンド（Go）はいいね 0 件のとき nil スライスを JSON 化して `null` を返す。`fetchLikedBlogs` の `data.map` が TypeError となり、TanStack Query は再取得失敗時も直前の成功データ（いいね済み一覧）を保持するため、`hasLiked` が true のまま残る
- 修正箇所:
  - `src/app/api/blog-likes/route.ts`（BFF: `null` → `[]` 正規化）
  - `src/app/lib/api/blog-likes/fetchLikedBlogs.ts`（`unknown` で受け `schemas/blogLikes.ts` で検証、`null` は `[]`）
- レベル配分: 不具合の層ごとに 1 つずつ配置し、どの層の防御が外れても検知できるようにする

| レベル | ファイル | 検証する層 |
|---|---|---|
| UT | `tests/api/blog-likes/route.test.ts` | BFF の正規化（`fetch` のみモック） |
| UT | `tests/lib/api/blog-likes/fetchLikedBlogs.test.ts` | クライアントの検証・正規化（`fetch` のみモック） |
| UT | `tests/hooks/useLikeBlog.lastUnlike.test.ts` | フック〜API アクセス層の結合（`fetch` のみモック。不具合の経路を通す） |
| IT | `tests-it/api/blog-likes.it.test.ts` | 実 Go バックエンドが実際に `null` を返す前提での BFF 正規化 |
| E2E | `e2e/tests/pages/blog_detail/blog_detail_like.spec.ts`（S-2） | 画面上の症状（ボタンがグレーに戻る） |

---

## BFF `GET /api/blog-likes`

| # | 分類 | テストケース | 期待結果 |
|---|---|---|---|
| N-1 | 正常系 | backend が配列を返す | そのまま返す・Cookie を backend へ転送 |
| S-1 | 準正常系 | backend が `null`（0 件） | `[]` を返す |
| S-2 | 準正常系 | `null` + Set-Cookie | `[]` を返し Set-Cookie を引き継ぐ |
| S-3 | 準正常系 | backend が `[]` | `[]` を返す |
| E-1 | 異常系 | backend が 500 | ステータス・本文をそのまま返す（`[]` に化けさせない） |
| E-2 | 異常系 | `BACKEND_API_URL` 未設定 | 500・backend を呼ばない |

## fetchLikedBlogs

| # | 分類 | テストケース | 期待結果 |
|---|---|---|---|
| N-1 | 正常系 | 配列 | `blog_id` の配列を返す |
| S-1 | 準正常系 | `null` | `[]` |
| S-2 | 準正常系 | `[]` | `[]` |
| E-1 | 異常系 | `ok: false` | `TOAST_LIKE_BLOG_ERROR` で throw |
| E-2 | 異常系 | 配列でない（エラーオブジェクト） | `ZodError` |
| E-3 | 異常系 | `blog_id` 欠落要素 | `ZodError`（`undefined` を ID として返さない） |
| E-4 | 異常系 | JSON パース失敗 | 例外を伝播 |

## useLikeBlog（結合・回帰）

| # | 分類 | テストケース | 期待結果 |
|---|---|---|---|
| S-1 | 準正常系 | 最後のいいねを解除（以後 backend は `null`） | `hasLiked` が false・クエリは success・データは `[]` |
| S-2 | 準正常系 | 0 件（`null`）から開始しいいね | 開始時 false → いいね後 true |
| S-3 | 準正常系 | 2 件中 1 件を解除 | 解除した記事のみ false |

## IT（実スタック）

| # | 分類 | テストケース | 期待結果 |
|---|---|---|---|
| N-1 | 正常系 | 発行 → いいね → 一覧 → 解除 → 一覧 | 一覧は `[blogId]` → `[]`（`null` ではない） |
| S-1 | 準正常系 | 発行直後の一覧 | `[]` |
| S-2 | 準正常系 | 二重いいね | 2 回目 400・一覧は 1 件 |
| E-1 | 異常系 | 訪問者 Cookie なし | 500 `Failed to get visit id token` をそのまま返す |
| E-2 | 異常系 | 不正トークン | 500 `Failed to get visit id` をそのまま返す |

## E2E

| # | 分類 | テストケース | 期待結果 |
|---|---|---|---|
| S-2 | 準正常系 | いいね済み → 解除（以後一覧 API は `null`） | ボタンが `text-gray-500`（未いいね）に戻る |

## 修正前コードでの検証（テストが不具合を捕捉できることの確認）

- UT: 修正を戻すと 7 件失敗（BFF 正規化 2・クライアント検証 3・フック回帰 2）
- IT: BFF 正規化を戻すと 2 件が `expected null to deeply equal []` で失敗（実 backend が `null` を返すことの実証）
- E2E: クライアント修正を戻すと S-2 が失敗（ボタンが `text-sky-500` のまま＝issue の症状そのもの）
