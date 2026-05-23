# コードスタイル

詳細仕様は `docs/10-miscellaneous-specification.md` を参照。以下は Claude が常に守るべき要点。

## コード規約

- パスエイリアス: `@/*` で `./src/*` を参照
- Prettier設定: タブ幅4、シングルクォート、末尾カンマ
- 通知: react-hot-toastを使用

## 状態管理の使い分け

- **React Context** (`contexts/`): 認証状態、グローバルデータ（カテゴリ、タグ、人気記事）
- **TanStack Query**: サーバー状態（ブログ、コメント）のフェッチ・キャッシュ
- **Zustand** (`stores/`): ローカルUI状態
