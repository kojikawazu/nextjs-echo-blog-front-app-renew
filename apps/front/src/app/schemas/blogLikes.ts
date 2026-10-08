import { z } from 'zod';

/**
 * いいね済み一覧 API（`GET /api/blog-likes`）のレスポンススキーマ。
 *
 * BFF は常に配列を返す契約だが、バックエンド（Go）はいいね 0 件のとき nil スライスを
 * JSON 化して `null` を返す。BFF を経由しない経路や将来の変更にも耐えるよう、
 * `null` も「0 件」として受け入れる（#17）。
 */
export const likedBlogsResponseSchema = z
    .array(
        z.object({
            /** いいね対象のブログ ID */
            blog_id: z.string(),
        }),
    )
    .nullable();

/**
 * いいね済み一覧 API のレスポンス型。`null` は「いいね 0 件」を表す。
 */
export type LikedBlogsResponse = z.infer<typeof likedBlogsResponseSchema>;
