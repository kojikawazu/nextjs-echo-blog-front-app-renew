import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../authSchema';

describe('loginSchema', () => {
    // --- 正常系 ---

    it('should pass with valid email and password', () => {
        const result = loginSchema.safeParse({
            email: 'user@example.com',
            password: 'pass123',
        });
        expect(result.success).toBe(true);
    });

    // --- 準正常系 ---

    it('should fail when email format is invalid', () => {
        const result = loginSchema.safeParse({
            email: 'not-email',
            password: 'pass123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toBeDefined();
        }
    });

    it('should fail when password is shorter than 6 characters', () => {
        const result = loginSchema.safeParse({
            email: 'user@example.com',
            password: 'abc',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toBeDefined();
        }
    });

    it('should fail when email is empty', () => {
        const result = loginSchema.safeParse({
            email: '',
            password: 'pass123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toBeDefined();
        }
    });
});

describe('registerSchema', () => {
    // --- 正常系 ---

    it('should pass with valid name, email and password', () => {
        const result = registerSchema.safeParse({
            name: '太郎',
            email: 'user@example.com',
            password: 'pass123',
        });
        expect(result.success).toBe(true);
    });

    // --- 準正常系 ---

    it('should fail when name is 1 character (below minimum 2)', () => {
        const result = registerSchema.safeParse({
            name: '太',
            email: 'user@example.com',
            password: 'pass123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.name).toBeDefined();
        }
    });

    it('should fail when email format is invalid', () => {
        const result = registerSchema.safeParse({
            name: '太郎',
            email: 'bad-email',
            password: 'pass123',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toBeDefined();
        }
    });
});
