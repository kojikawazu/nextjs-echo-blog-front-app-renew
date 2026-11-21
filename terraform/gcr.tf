# ---------------------------------------------
# Artifact Registry
# ---------------------------------------------
# Artifact Registryリポジトリの作成
resource "google_artifact_registry_repository" "nextjs_echo_blog_app_repo" {
  location      = var.gcp_region
  repository_id = var.repository_id
  description   = "Docker repository for Next.js Echo Blog App"
  format        = "DOCKER"

  # 古いイメージの掃除は GCP のクリーンアップポリシーに任せる（#169）。
  # ワークフローで「新しい順に 6 件目以降を削除」していたが、ubuntu-26.04 のランナーから
  # docker push が OCI の親マニフェスト（image index）＋子マニフェストを上げるようになり、
  # 親が残っている子を消そうとして失敗するようになった。
  # クリーンアップポリシーは親から参照される子を削除せず、親が消えた後の実行で子も消す。
  # 実行は 1 日 1 回程度のバックグラウンド処理で、push 直後には消えない。
  cleanup_policy_dry_run = false

  # タグなし（latest タグが外れた過去のイメージ）を削除の対象にする。
  # タグ付き（本番で動いている latest）は対象にしない
  cleanup_policies {
    id     = "delete-untagged"
    action = "DELETE"
    condition {
      tag_state = "UNTAGGED"
    }
  }

  # ロールバック用に新しい 5 件を残す（KEEP は DELETE より優先される）。
  # 件数はワークフローで掃除していたときの「最新 5 世代」に揃えた
  cleanup_policies {
    id     = "keep-most-recent-5"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }
}
