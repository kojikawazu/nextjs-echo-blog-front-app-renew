import { z } from 'zod';

/**
 * ブログ生成フォームのスキーマ
 */
export const blogCreateSchema = z.object({
    title: z.string().min(1, 'タイトルは1文字以上必要です').optional(),
    github_url: z.string().url('正しいURLを入力してください').optional(),
    category: z.string().min(1, 'カテゴリは1文字以上必要です').optional(),
    tags: z.string().min(1, 'タグは1文字以上必要です').optional(),
    description: z.string().min(1, '内容は1文字以上必要です').optional(),
});

/**
 * ブログ生成フォームの型
 */
export type BlogCreateFormValues = z.infer<typeof blogCreateSchema>;

/**
 * ブログ編集フォームのスキーマ
 */
export const blogEditSchema = z.object({
    title: z.string().min(1, 'タイトルは1文字以上必要です').optional(),
    github_url: z.string().url('正しいURLを入力してください').optional(),
    category: z.string().min(1, 'カテゴリは1文字以上必要です').optional(),
    tags: z.string().min(1, 'タグは1文字以上必要です').optional(),
    description: z.string().min(1, '内容は1文字以上必要です').optional(),
});

/**
 * ブログ編集フォームの型
 */
export type BlogEditFormValues = z.infer<typeof blogEditSchema>;
