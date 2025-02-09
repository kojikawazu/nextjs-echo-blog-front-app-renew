import matter from 'gray-matter';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';

/**
 * GitHub URLからMarkdownファイルの内容を取得する
 * @param githubUrls
 * @returns markdown content or null
 */
export const fetchMarkdown = async (githubUrls: string) => {
    const regex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/main\/(.+\.md)$/;
    const match = githubUrls.match(regex);
    const githubToken = process.env.GITHUB_TOKEN;
    if (!match) {
        console.error('Invalid GitHub Markdown URL format.');
        return null;
    }

    // GitHub API用のURLを構築
    const owner = match[1];
    const repo = match[2];
    const path = match[3];
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers: HeadersInit = {
        Accept: 'application/vnd.github.v3.raw',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    };

    try {
        // GitHub APIからMarkdownファイルの内容を取得
        const resGitHub = await fetch(apiUrl, {
            headers,
        });

        console.log('GitHub API response status: ', resGitHub.status);

        if (resGitHub.ok) {
            // Markdownファイルの内容を取得
            const resMdContent = await resGitHub.text();
            //console.log('Markdown content:', resMdContent);

            // フロントマターを解析・除去
            const { content } = matter(resMdContent);
            return content;
        } else {
            console.error(
                'Failed to fetch Markdown content from GitHub status: ',
                resGitHub.status,
            );
            return null;
        }
    } catch (error) {
        console.error(`${COMMON_CONSTANTS.GITHUB.ERROR_MESSAGE.API_ROUTER_ERROR}: `, error);
        throw new Error('GitHub API Error: ' + error);
    }
};
