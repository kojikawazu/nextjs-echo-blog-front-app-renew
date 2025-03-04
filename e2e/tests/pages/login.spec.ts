import { test, expect } from '@playwright/test';
import { setupAuthCheckMock, setupLoginMock } from '../mocks/api/auth-api-mock';

test.describe('Home Page (Unauthenticated)', () => {
    test('Unauthenticated user is redirected to login page', async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });

        // ホームページにアクセス
        await page.goto('/');

        // 未認証でもホームにアクセスできる
        await expect(page).toHaveURL('/');
    });

    test('Login page is displayed', async ({ page }) => {
        // APIのモック設定（auth-checkで認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });

        // ログインページにアクセス
        await page.goto('/login');

        // ログインページが表示される
        await expect(page).toHaveURL('/login');
        await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();

        // ログインフォームが表示される
        await expect(page.getByLabel('メールアドレス')).toBeVisible();
        await expect(page.getByLabel('パスワード')).toBeVisible();
        await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
        await expect(page.getByText('アカウントをお持ちでない方は')).toBeVisible();
        await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible();
    });

    test('Login with valid credentials', async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
        // ログインAPIのモック設定（成功）
        await setupLoginMock(page, { success: true });
        // APIのモック設定（auth-checkで認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: true });

        // ログインページにアクセス
        await page.goto('/login');

        // ログインフォームに入力
        await page.getByLabel('メールアドレス').fill('mockuser@example.com');
        await page.getByLabel('パスワード').fill('password');

        // ログインボタンをクリック
        await page.getByRole('button', { name: 'ログイン' }).click();

        // ログイン後のリダイレクト先にリダイレクトされるまで待機
        await page.waitForURL('/');

        // ログイン後のリダイレクト先にリダイレクトされる
        await expect(page).toHaveURL('/');
    });

    test('Login with input invalid credentials', async ({ page }) => {
        // ログインページにアクセス
        await page.goto('/login');

        // ログインボタンをクリック
        await page.getByRole('button', { name: 'ログイン' }).click();

        // ログイン失敗のメッセージが表示される
        await expect(page.getByText('正しいメールアドレスを入力してください')).toBeVisible();
        await expect(page.getByText('パスワードは6文字以上必要です')).toBeVisible();
    });

    test('Login with invalid credentials', async ({ page }) => {
        // APIのモック設定（auth-checkで未認証状態を返す）
        await setupAuthCheckMock(page, { authenticated: false });
        // ログインAPIのモック設定（成功）
        await setupLoginMock(page, { success: false });

        // ログインページにアクセス
        await page.goto('/login');

        // ログインフォームに入力
        await page.getByLabel('メールアドレス').fill('invalid@example.com');
        await page.getByLabel('パスワード').fill('invalidpassword');

        // ログインボタンをクリック
        await page.getByRole('button', { name: 'ログイン' }).click();

        // ログイン失敗のメッセージが表示される
        await expect(
            page.getByText('メールアドレスまたはパスワードが正しくありません'),
        ).toBeVisible();
    });
});
