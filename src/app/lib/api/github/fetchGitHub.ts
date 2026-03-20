// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * GitHub URLからMarkdownファイルの内容を取得する
 * Route Handler経由でサーバーサイドで取得するため、GITHUB_TOKENは露出しない
 * @param githubUrls
 * @returns markdown content or null
 */
export const fetchMarkdown = async (githubUrls: string) => {
    try {
        const response = await fetch(COMMON_CONSTANTS.URL.GITHUB_MARKDOWN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: githubUrls }),
        });

        if (!response.ok) {
            console.error('Failed to fetch Markdown content from GitHub status: ', response.status);
            return null;
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error(`${COMMON_CONSTANTS.GITHUB.ERROR_MESSAGE.API_ROUTER_ERROR}: `, error);
        throw new Error('GitHub API Error: ' + error);
    }
};
