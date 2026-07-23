---
description: JSDoc（TSDoc）ドキュメンテーションコメント規約 — TypeScript の公開シンボル・型メンバー・状態層に必須
globs: "apps/front/src/**"
---

# JSDoc 規約（TypeScript）

TypeScript コードの**公開シンボル**には JSDoc（TSDoc 記法）を**必須**とする。TypeDoc によるドキュメント生成を前提とする。

## 必須対象（公開シンボル）

以下の公開シンボルには JSDoc を必ず付与する:

- `export` された関数・クラス・メソッド・型（`type` / `interface`）・定数
- **型のメンバー**（`type` / `interface` の各プロパティ、union リテラルの各値）— 次節参照
- React コンポーネントの **props 型**（各プロパティに説明）
- カスタムフック（`useXxx`）と、**その戻り値の各メンバー**
- **store の state / action**（Zustand）、**Context value の各メンバー**（`AuthContext` / `GlobalContext`）— 後述「状態・ロジック層のコメント」参照
- 公開 API のハンドラー・サービスメソッド（Route Handler・`lib/api/` の通信関数）

**任意対象**: `export` されない内部関数、コンポーネント内に閉じた `useState`・ハンドラ関数、および処理が自明な 1 行ユーティリティ。ただし意図が非自明なものは内部でも付与する（「混乱テスト」）。

## 型定義のコメント（型本体 + メンバー）

`type` / `interface` は**型本体と各メンバーの両方**にコメントを付ける。型シグネチャは「形」しか語らないため、**意味・単位・制約・状態の定義**はコメントでしか残せない。

- **型本体**: 1 行目に「**何を表す型か**」を書く。どの層のものか（API レスポンス / ドメインエンティティ / props）も併記すると読み手が迷わない。
- **各プロパティ**: 型名から読み取れない情報を書く。特に以下は必須:
  - **単位**（`count` が件数か秒か、`likes` が累計か当日分か）
  - **`null` / `undefined` / 省略の意味**（「未設定」なのか「該当なし」なのか）
  - **制約・不変条件**（値域、フォーマット、他プロパティとの関係）
  - 自明なプロパティ（`id` 等）は省略してよい。**書くことがない項目に埋め草コメントを付けない**。
- **union リテラル**: 各値が**どの状態を指すか**を個別に書く。値の文字列そのものからは業務上の意味が読めない。
- コロケーションした非 `export` の型（props 型等）も、意味が非自明なら同様に付ける（判断は「混乱テスト」に従う）。

```ts
/**
 * ブログ一覧の並び順。
 */
export type BlogSortBy =
    /** 作成日時の降順。既定値 */
    | 'newest'
    /** いいね数の降順。同数は作成日時の降順で解決する */
    | 'popular';

/**
 * ブログ記事のデータ型。バックエンド API のレスポンス／一覧・詳細表示の基本単位。
 */
export type Blog = {
    id: string;
    /** 記事タイトル */
    title: string;
    /** 本文 Markdown を配置した GitHub の blob URL。`undefined` は「本文未登録」 */
    github_url?: string;
    /** タグ名の配列。順序は登録順で、表示順の意味は持たない */
    tags: string[];
    /** いいね数（累計）。訪問者 ID 単位で重複排除済み */
    likes: number;
    /** 作成日時（ISO 8601 文字列） */
    created_at: string;
};
```

## 状態・ロジック層のコメント（store / context / hooks）

store（Zustand）・Context の value・カスタムフックの戻り値は、**定義ファイルを開かずに利用される**。したがって「値が何を意味するか」「関数が何を変えるか」はコメントでしか伝わらない。

### 必須ラインは「参照範囲」で決める

型定義の配置（`typescript.md`）と同じ軸を使う。

| 対象 | コメント |
|---|---|
| **ファイルを越えて使われる** — store の state / action、Context value の各メンバー、カスタムフックの戻り値、`export` された関数 | **必須** |
| **ファイル内に閉じる** — コンポーネント内の `useState`・ハンドラ関数・ローカル変数 | **条件付き**（「なぜ」が非自明なときのみ。次節「混乱テスト」に従う） |

コンポーネント内部まで一律必須にしない。`setIsOpen` に「isOpen をセットする」と書くような**埋め草が量産され、本当に重要なコメントが埋もれる**ため。

### 型を先に定義してコメントを型側に置く

store やフック戻り値を**インラインのオブジェクトリテラル**で書くと、その中身は「宣言」ではなく「式」になるため、JSDoc 規約も Lint も効かない。**先に型を定義し、コメントは型のメンバーに書く**。こうすると前節「型定義のコメント」の規約がそのまま効く。

```ts
// ❌ インライン定義 — コメントの置き場がなく、Lint も拾えない
export const useBlogStore = create((set) => ({
    sortBy: 'newest',
    setSortBy: (s) => set({ sortBy: s }),
}));

// ✅ 型を先に定義 → 型メンバーのコメント規約と Lint が効く
/** ブログ一覧画面の絞り込み・並び替え状態。URL クエリとは同期しない（画面内に閉じる）。 */
type BlogState = {
    /** 現在の並び順。初期値は 'newest'（永続化しない） */
    sortBy: BlogSortBy;
    /** 並び順を変更する。API の再取得は走らない（クライアント側で並べ替える） */
    setSortBy: (sortBy: BlogSortBy) => void;
};

export const useBlogStore = create<BlogState>((set) => ({
    sortBy: 'newest',
    setSortBy: (sortBy) => set({ sortBy }),
}));
```

同じ手をカスタムフックの戻り値にも使う。**戻り値型を明示**すれば、各メンバーの説明が型側に集まる。

```ts
/** ブログのいいね状態の取得と切り替えを扱う。 */
type UseLikeBlogResult = {
    /** 現在の訪問者がいいね済みか。判定前は false（`undefined` にはしない） */
    isLiked: boolean;
    /** 表示用のいいね数。楽観更新で即時反映される */
    likes: number;
    /** いいねを切り替える。実行中に呼んでも多重リクエストは発生しない */
    toggleLike: () => Promise<void>;
};

export function useLikeBlog(blogId: string): UseLikeBlogResult { /* ... */ }
```

### 書くべき内容

state / action に書くのは**シグネチャから読めない情報**に限る。

- **その値がいつ変わるか / 誰が変えるか**（「ログアウト時にリセットされる」）
- **初期値・空値の意味**（「空配列は『0 件』であり『未取得』ではない」）
- **副作用の有無**（「この action は API を呼ばない。トースト通知も出さない」）
- **他の値との関係・不変条件**（「`filteredBlogs` は必ず `blogs` の部分集合」）

## 混乱テスト（公開/内部・本番/テストを問わない）

判断軸は「public か否か」ではなく **「1 か月後の自分／他プロジェクト帰りの読み手が『これは何？なぜ？』となるか」**。なるなら、内部関数でもテストコードでも "why" を残す。

- **キャスト・回避策には "why" 必須**: `as unknown as` / `as any` / `@ts-ignore` / `@ts-expect-error` / マジック値 / 複雑な正規表現 / 明示的なワークアラウンド。**型を欺く・仕様を迂回する箇所は、その根拠（なぜ安全か／なぜ必要か）がコードから消える**ため、コメントが唯一の記録になる。
  - 例: テストダブルを `repo as unknown as Repository<Blog>` で注入する場合、「ダブルは対象が実際に呼ぶメソッドだけの部分実装で、実型は構造的に大きいため二段キャストで隙間を埋める（実行時は使う分だけで足りる）」と残す。
- **テスト足場**（SUT ビルダー・複雑な fixture・非自明な mock）も、意図が読み取りにくいなら付ける。

## 記述ルール

- **型は書かない**: 型は TypeScript のシグネチャが唯一の真実（source of truth）。JSDoc に `{string}` 等の型ブレースを併記しない（二重管理・型ずれの原因になる）。JSDoc は**意図・意味・制約**を日本語で記述する。
- **要約行必須**: 1 行目にそのシンボルが「何をするか」を簡潔に書く。
- **`@param` 必須**: 全引数に `@param name - 説明` を記述する。オプション引数・デフォルト値の意味も明記する。
- **`@returns` 必須**: 戻り値がある場合は `@returns 説明` を記述する（`void` / JSX 返却のコンポーネントは省略可）。
- **`@throws` 必須**: 意図的に例外を投げる場合は `@throws {ErrorType} 発生条件` を記述する。
- **補助タグ（任意）**: `@example` `@deprecated` `@see` は必要に応じて使う。

## 例

```ts
/**
 * ブログ ID から記事詳細を取得する。BFF プロキシ経由でバックエンドを呼ぶ。
 *
 * @param id - 対象ブログの UUID
 * @returns 記事データ。存在しない場合は `null`
 * @throws {Error} API 通信に失敗した場合
 */
export async function fetchBlogById(id: string): Promise<Blog | null> {
    // ...
}
```

## Lint による強制（推奨）

`eslint-plugin-jsdoc` を導入し、公開シンボルへの JSDoc 欠落・`@param` / `@returns` 漏れを CI で検出する。TypeScript プロジェクトでは型ブレース系ルールを無効化する（`jsdoc/require-param-type` / `jsdoc/require-returns-type` を off）。

型定義の検出は `jsdoc/require-jsdoc` の `contexts` に AST セレクタを追加する（型本体 = `TSTypeAliasDeclaration` / `TSInterfaceDeclaration`、メンバー = `TSPropertySignature`）。ただし「書くことがない項目に埋め草コメントを付けない」方針と衝突しやすいため、**メンバー単位の強制は warn から始める**（誤検知が多ければ対象を `types/**` に絞る）。

store・フック戻り値も、上記「型を先に定義する」に従えば `TSPropertySignature` として同じルールで検出できる。**オブジェクトリテラルのプロパティを直接 Lint で強制しようとしない**（宣言ではないため誤検知が多く、実効性が低い）。型定義へ寄せることで強制力を得るのが本方針の要。
