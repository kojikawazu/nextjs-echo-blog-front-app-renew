import { z } from 'zod';

/**
 * ログインフォームのスキーマ
 */
export const loginSchema = z.object({
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});

/**
 * ログインフォームの型
 */
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * 新規登録フォームのスキーマ
 */
export const registerSchema = z.object({
    name: z.string().min(2, '名前は2文字以上必要です'),
    email: z.string().email('正しいメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上必要です'),
});

/**
 * 新規登録フォームの型
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;
