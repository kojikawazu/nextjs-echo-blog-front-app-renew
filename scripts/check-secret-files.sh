#!/usr/bin/env bash
#
# 鍵・証明書・.env 系の秘匿ファイルが Git に追跡されていないかを検査する。
# CI（.github/workflows/secret-scan.yml）と PR 作成前のローカル検査で同じ判定を使うため、
# 検出パターンと除外パターンの定義はこのファイルだけに置く。
#
# 使い方:
#   scripts/check-secret-files.sh           追跡済み + 未追跡（.gitignore されていない）ファイルを検査する
#   scripts/check-secret-files.sh --stdin   標準入力のパス一覧（1 行 1 パス）を検査する（分類テスト用）
#
# 終了コード:
#   0  秘匿ファイルなし
#   1  秘匿ファイルを検出（該当パスを標準出力に列挙）
#   2  検査できない（git リポジトリ外・不正な引数）。素通りさせず失敗として扱う（fail-closed）

set -euo pipefail

# 検出: .env 系、鍵・証明書の拡張子、SSH 秘密鍵、クラウドの認証情報 JSON
readonly SECRET_PATTERN='(^|/)(\.env(\..+)?|[^/]+\.(key|pem|p12|pfx|jks|keystore)|id_rsa|id_ed25519|id_dsa|credentials\.json|serviceAccountKey\.json)$'
# 除外: テンプレート（.env.example 等）と型定義（env.d.ts）。中身が秘匿値ではないため誤検知になる
readonly EXCLUDE_PATTERN='\.(example|sample|template|dist)$|\.env\.d\.ts$'

# パス一覧（標準入力）から秘匿ファイルだけを抜き出す。該当なしでも終了コード 0 を返す
filter_secret_paths() {
    { grep -E "${SECRET_PATTERN}" || true; } | { grep -vE "${EXCLUDE_PATTERN}" || true; }
}

case "${1:-}" in
    --stdin)
        found=$(filter_secret_paths)
        ;;
    '')
        if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
            echo "::error::git リポジトリ外では検査できません" >&2
            exit 2
        fi
        # 追跡済みに加え、.gitignore 漏れで今後追跡されうる未追跡ファイルも見る
        found=$({ git ls-files; git ls-files --others --exclude-standard; } | filter_secret_paths)
        ;;
    *)
        echo "::error::不明な引数です: ${1}（引数なし、または --stdin のみ指定できます）" >&2
        exit 2
        ;;
esac

if [ -n "${found}" ]; then
    echo "::error::秘匿ファイルが Git 管理下（または .gitignore 漏れ）にあります。追跡を外しても履歴からは消えないため、push 済みなら鍵・トークンのローテーションが必要です。"
    echo "${found}"
    exit 1
fi

echo "OK: 秘匿ファイルはありません"
