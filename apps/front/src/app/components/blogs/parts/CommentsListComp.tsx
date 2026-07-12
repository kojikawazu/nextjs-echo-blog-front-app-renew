import { PulseLoader } from 'react-spinners';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import type { Comment } from '@/app/types/blogs';

interface CommentsListCompProps {
    comments: Comment[];
    isLoading: boolean;
    isError: boolean;
}

/**
 * コメントリストコンポーネント
 * @param comments コメントリスト
 * @param isLoading ローディング中かどうか
 * @param isError エラーかどうか
 * @returns JSX.Element
 */
export function CommentsListComp({ comments, isLoading, isError }: CommentsListCompProps) {
    return (
        <>
            {isLoading ? (
                <div className="h-16 flex items-center justify-center h-screen">
                    <PulseLoader color="#dddddd" size={10} />
                </div>
            ) : isError ? (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-gray-500 text-2xl">
                        {COMMON_CONSTANTS.BLOG_COMMENTS.TOAST_FETCH_COMMENTS_ERROR}
                    </p>
                </div>
            ) : (
                <>
                    {comments.length > 0 &&
                        comments.map((comment) => (
                            <div key={comment.id} className="mb-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="font-bold text-gray-900">
                                            {comment.guest_user}
                                        </div>
                                        <div className="text-sm text-sky-700 bg-sky-50 rounded-full px-3 py-1">
                                            {new Date(comment.created_at).toLocaleDateString(
                                                'ja-JP',
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {comment.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                </>
            )}
        </>
    );
}
