import { describe, it, expect } from 'vitest';
import { blogCommentSchema } from '../blogCommentSchema';

describe('blogCommentSchema', () => {
    // --- 正常系 ---

    it('should pass with valid blog_id, guest_user and comment', () => {
        const result = blogCommentSchema.safeParse({
            blog_id: 'abc-123',
            guest_user: '太郎',
            comment: '良い記事でした',
        });
        expect(result.success).toBe(true);
    });

    // --- 準正常系 ---

    it('should fail when comment is empty string (min(1) applies when field is present)', () => {
        // optional()はundefinedのみ許可。空文字はmin(1)チェックが発動してfailする
        const result = blogCommentSchema.safeParse({ comment: '' });
        expect(result.success).toBe(false);
    });

    it('[既知課題] should pass when all fields are omitted (undefined bypasses min(1) due to optional())', () => {
        // 既知課題: undefined は optional() で通過するため、フィールド未送信を防げない
        // 必須チェックはHTML required属性に依存している
        const result = blogCommentSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});
