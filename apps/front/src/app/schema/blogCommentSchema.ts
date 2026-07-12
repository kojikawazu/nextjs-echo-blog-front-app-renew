import { z } from 'zod';

/**
 * ブログコメントフォームのスキーマ
 */
export const blogCommentSchema = z.object({
    blog_id: z.string().min(1, 'ブログIDは1文字以上必要です').optional(),
    guest_user: z.string().min(1, 'ゲスト名は1文字以上必要です').optional(),
    comment: z.string().min(1, 'コメントは1文字以上必要です').optional(),
});

/**
 * ブログコメントフォームの型
 */
export type BlogCommentFormValues = z.infer<typeof blogCommentSchema>;
