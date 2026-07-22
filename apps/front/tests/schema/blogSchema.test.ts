import { describe, it, expect } from 'vitest';
import { blogCreateSchema, blogEditSchema } from '@/app/schema/blogSchema';

describe('blogCreateSchema', () => {
    // --- 正常系 ---

    it('should pass with all valid fields', () => {
        const result = blogCreateSchema.safeParse({
            title: 'Next.js入門',
            github_url: 'https://github.com/example/repo',
            category: 'Tech',
            tags: 'React,Next.js',
            description: '記事の内容です',
        });
        expect(result.success).toBe(true);
    });

    it('should pass with a valid github_url', () => {
        const result = blogCreateSchema.safeParse({
            github_url: 'https://github.com/foo/bar',
        });
        expect(result.success).toBe(true);
    });

    // --- 準正常系 ---

    it('should fail when github_url is not a valid URL', () => {
        const result = blogCreateSchema.safeParse({
            github_url: 'not-a-url',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.github_url).toBeDefined();
        }
    });

    it('should fail when title is empty string (min(1) applies when field is present)', () => {
        // optional()はundefinedのみ許可。空文字はmin(1)チェックが発動してfailする
        const result = blogCreateSchema.safeParse({ title: '' });
        expect(result.success).toBe(false);
    });

    it('[既知課題] should pass when all fields are omitted (undefined bypasses min(1) due to optional())', () => {
        // 既知課題: undefined は optional() で通過するため、フィールド未送信を防げない
        // 必須チェックはHTML required属性に依存している
        const result = blogCreateSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    // --- 異常系（想定外の型・入力 → 安全に fail） ---

    it('should fail when title is a non-string (number)', () => {
        // 想定外: 文字列フィールドに数値。型不一致で安全に fail する
        const result = blogCreateSchema.safeParse({ title: 123 });
        expect(result.success).toBe(false);
    });

    it('should fail when github_url is null (optional accepts undefined, not null)', () => {
        // 想定外: optional() は undefined のみ許可。null は弾く
        const result = blogCreateSchema.safeParse({ github_url: null });
        expect(result.success).toBe(false);
    });

    it('should fail when tags is an array (string expected)', () => {
        // 想定外: tags は "a,b" 形式の文字列。配列は型不一致で fail
        const result = blogCreateSchema.safeParse({ tags: ['react', 'next'] });
        expect(result.success).toBe(false);
    });

    it('should fail when input is not an object (null)', () => {
        // 想定外: オブジェクト以外のルート入力は安全に fail
        const result = blogCreateSchema.safeParse(null);
        expect(result.success).toBe(false);
    });
});

describe('blogEditSchema', () => {
    // --- 正常系 ---

    it('should pass with all valid fields', () => {
        const result = blogEditSchema.safeParse({
            title: '更新後タイトル',
            github_url: 'https://github.com/example/repo',
            category: 'Tech',
            tags: 'React',
            description: '更新後の内容',
        });
        expect(result.success).toBe(true);
    });

    // --- 準正常系 ---

    it('should fail when github_url is not a valid URL', () => {
        const result = blogEditSchema.safeParse({
            github_url: 'invalid-url',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.github_url).toBeDefined();
        }
    });

    it('[既知課題] should pass when all fields are omitted (undefined bypasses min(1) due to optional())', () => {
        const result = blogEditSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});
