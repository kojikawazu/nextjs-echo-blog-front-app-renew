import { Page } from '@playwright/test';

/**
 * 認証チェックAPIのモック設定
 * @param page
 * @param options
 */
export async function setupAuthCheckMock(page: Page, options: { authenticated: boolean }) {
    await page.route('**/users/auth-check', async (route) => {
        const jsonResponse = options.authenticated
            ? {
                  user_id: 'mock-user-id',
                  username: 'Mock User',
                  email: 'mockuser@example.com',
              }
            : null; // 未ログイン時はnullを返す

        await route.fulfill({
            status: options.authenticated ? 200 : 401,
            contentType: 'application/json',
            body: JSON.stringify(jsonResponse),
        });
    });
}

/**
 * ログインAPIのモック設定
 * @param page
 * @param options
 */
export async function setupLoginMock(page: Page, options: { success: boolean }) {
    await page.route('**/users/login', async (route) => {
        if (options.success) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'Login successful',
                }),
                headers: {
                    'Set-Cookie': 'token=mocked-token; Path=/; HttpOnly;',
                },
            });
        } else {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Invalid credentials' }),
            });
        }
    });
}

/**
 * ログアウトAPIのモック設定
 * @param page
 * @param options
 */
export async function setupLogoutMock(page: Page, options: { success: boolean }) {
    await page.route('**/users/logout', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Logout successful' }),
        });
    });
}
