import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
    // テストファイルのディレクトリ
    testDir: './e2e/tests',
    // テストの実行回数
    retries: process.env.CI ? 2 : 0,
    // テストの実行結果のレポート
    reporter: [['html', { outputFolder: 'playwright-report' }]],
    // テストの実行環境
    use: {
        // テストの実行環境のベースURL
        baseURL: 'http://localhost:3000',
        // テストの実行環境のトレース
        trace: 'on-first-retry',
    },
    // テストの実行環境
    webServer: {
        // テストの実行環境のコマンド
        command: 'npm run dev',
        // テストの実行環境のURL
        url: 'http://localhost:3000',
        // テストの実行環境の再利用
        reuseExistingServer: !process.env.CI,
    },
});
