#!/usr/bin/env bash
#
# scripts/check-secret-files.sh の分類テスト。
# --stdin モードで代表パスを 1 件ずつ判定し、検出／素通りが期待どおりかを検証する。
# 実ファイルを作らずに済むため、作業ツリーを汚さない。

set -uo pipefail

SCRIPT="$(cd "$(dirname "$0")" && pwd)/check-secret-files.sh"
readonly SCRIPT
failures=0

# パスを 1 件判定させ、終了コードが期待値と一致するかを見る
# $1: 期待する終了コード（1 = 検出 / 0 = 素通り）  $2: パス
assert_path() {
    local expected=$1 path=$2 actual
    printf '%s\n' "${path}" | bash "${SCRIPT}" --stdin >/dev/null 2>&1
    actual=$?
    if [ "${actual}" -ne "${expected}" ]; then
        echo "FAIL: '${path}' exit=${actual}（期待 ${expected}）"
        failures=$((failures + 1))
    fi
}

# --- 正常系: 秘匿ファイルを検出する ---
for path in \
    config/master.key \
    front/.env \
    front/.env.local \
    base/.env.production \
    .env \
    certs/server.pem \
    certs/client.p12 \
    secrets/id_rsa \
    secrets/id_ed25519 \
    gcp/serviceAccountKey.json \
    gcp/credentials.json; do
    assert_path 1 "${path}"
done

# --- 準正常系: テンプレート・型定義・紛らわしい名前は素通りする ---
for path in \
    front/.env.example \
    front/.env.local.example \
    .env.sample \
    .env.template \
    src/env.d.ts \
    front/.env.d.ts \
    docs/keyboard.md \
    src/apiKey.ts \
    src/keys.ts \
    README.md \
    secrets/id_rsa.pub \
    docs/environment.md \
    .envrc \
    src/env.ts \
    config/env.production.ts \
    apps/front/next-env.d.ts \
    scripts/load.env.sh \
    src/privateKey.ts \
    assets/keystore-icon.svg; do
    assert_path 0 "${path}"
done

# --- 異常系: 検出時は該当パスだけを列挙し、混在しても素通り側を巻き込まない ---
output=$(printf '%s\n' README.md apps/front/.env apps/front/.env.example | bash "${SCRIPT}" --stdin 2>/dev/null)
code=$?
if [ "${code}" -ne 1 ] || ! grep -qx 'apps/front/.env' <<<"${output}" || grep -q '\.env\.example' <<<"${output}"; then
    echo "FAIL: 混在入力で .env のみを検出すること（exit=${code}）"
    failures=$((failures + 1))
fi

# --- 異常系: 不明な引数は fail-closed で終了コード 2 ---
bash "${SCRIPT}" --unknown >/dev/null 2>&1
code=$?
if [ "${code}" -ne 2 ]; then
    echo "FAIL: 不明な引数は exit=2 であること（exit=${code}）"
    failures=$((failures + 1))
fi

# --- 異常系: git リポジトリ外では fail-closed で終了コード 2 ---
tmpdir=$(mktemp -d)
(cd "${tmpdir}" && GIT_CEILING_DIRECTORIES="${tmpdir}" bash "${SCRIPT}" >/dev/null 2>&1)
code=$?
rm -rf "${tmpdir}"
if [ "${code}" -ne 2 ]; then
    echo "FAIL: git リポジトリ外は exit=2 であること（exit=${code}）"
    failures=$((failures + 1))
fi

if [ "${failures}" -gt 0 ]; then
    echo "NG: ${failures} 件失敗"
    exit 1
fi
echo "OK: 全ケース成功"
