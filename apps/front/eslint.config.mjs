import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/**", ".next/**", "*.backup"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // 「async フェッチ前に loading 状態をセット」等は正当なパターン。error だと過剰なため
      // 可視化目的の warn に留める（挙動変更を伴う修正は別タスク）。
      "react-hooks/set-state-in-effect": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // JSDoc 規約（TSDoc スタイル）の機械的に判定できる部分を強制する。
  // 有効ルールの唯一の真実はこのブロック。方針の根拠は .claude/rules/jsdoc.md。
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { jsdoc },
    // TS 前提。型は JSDoc ではなくシグネチャに委ねる。
    settings: { jsdoc: { mode: "typescript" } },
    rules: {
      // 型の再掲を禁止（TS シグネチャが型の唯一の真実）。
      "jsdoc/no-types": "error",
      // JSDoc ブロックを持つ関数は全引数を @param で説明する。
      // 分割代入 props は型（XxxProps）が真実なので props.x 単位には展開しない。
      "jsdoc/require-param": ["error", { checkDestructured: false, checkDestructuredRoots: false }],
      "jsdoc/require-param-description": "error",
      // @param 名と実引数名を突き合わせる（名前ズレ・順序・過不足を検出）。
      // 本 repo は分割代入 props を per-prop（@param isOpen 等）で記述する慣習（jsdoc.md
      // 「各プロパティに説明」に準拠）。分割代入ルート（props.x）単位の展開チェックは無効化し、
      // トップレベルの @param 名照合のみ行う。
      "jsdoc/check-param-names": ["error", { checkDestructured: false }],
      // 返り値がある関数は @returns に意味を書く（.tsx コンポーネントは後続ブロックで除外）。
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      // 書いた JSDoc の体裁を整える。
      "jsdoc/check-alignment": "warn",
      "jsdoc/no-multi-asterisks": "warn",
      // require-jsdoc は // 行コメントを誤検知するため未採用。ブロックの有無・質はレビューで確認する。
    },
  },
  {
    // React コンポーネント（JSX を返す .tsx）は @returns を要求しない（「@returns …の要素」はノイズ）。
    // .ts のフック / lib / API では @returns 必須のまま。
    files: ["src/**/*.tsx"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-description": "off",
      // コンポーネントは分割代入 props を per-prop（@param isOpen 等）で記述する慣習。
      // flat な per-prop 名は check-param-names の分割代入照合と構造的に非互換のため、
      // .tsx では無効化する（.ts の名前付き引数では有効のまま名前ズレを検出する）。
      "jsdoc/check-param-names": "off",
    },
  },
  {
    // テストコード・テスト足場は「公開シンボル」ではないため JSDoc 必須系を免除する
    // （jsdoc.md の必須対象は公開 API・コンポーネント props・フック等）。書かれた JSDoc の
    // 整合性チェック（no-types / check-param-names）は残す。display-name もテストの
    // インラインラッパーには不要。
    files: ["src/**/__tests__/**", "src/**/*.test.{ts,tsx}", "src/test/**"],
    rules: {
      "jsdoc/require-param": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-returns-description": "off",
      "react/display-name": "off",
    },
  },
];
