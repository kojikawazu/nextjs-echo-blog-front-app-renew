'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
// constants
import { COMMON_CONSTANTS } from '@/app/utils/const/constants';
// types
import { User } from '@/app/types/users';

// Context で提供する値の型
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// Context の作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
    // router
    const router = useRouter();

    /**
     * 認証状態を取得
     */
    const {
        data: user,
        isLoading,
        refetch,
    } = useQuery<User | null>({
        queryKey: ['authUser'],
        queryFn: async () => {
            const response = await fetch(
                COMMON_CONSTANTS.API_URL + COMMON_CONSTANTS.URL.AUTH_CHECK,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            if (!response.ok) return null;

            const dataJson = await response.json();
            const safeUser: User = {
                id: dataJson.user_id,
                name: dataJson.username,
                email: dataJson.email,
                created_at: '',
                updated_at: '',
            };
            return safeUser;
        },
        initialData: null,
    });

    /**
     * ログイン処理
     */
    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const response = await fetch(COMMON_CONSTANTS.API_URL + COMMON_CONSTANTS.URL.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('ログインに失敗しました');
            }

            return response.json();
        },
        onSuccess: async () => {
            // 認証状態を再取得
            await refetch();
            // ホーム画面へ移動
            router.push('/');
        },
        onError: () => {
            alert('メールアドレスまたはパスワードが正しくありません');
        },
    });

    /**
     * ログアウト処理
     */
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(COMMON_CONSTANTS.API_URL + COMMON_CONSTANTS.URL.LOGOUT, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('ログアウトに失敗しました');
            }

            return response.json();
        },
        onSuccess: async () => {
            // 認証状態を再取得
            await refetch();
            // ログイン画面へ移動
            router.push('/login');
        },
    });

    // Context の値を定義
    const value = {
        user: user ?? null,
        isLoading,
        signIn: (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
        signOut: () => logoutMutation.mutateAsync(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context を利用するカスタムフック
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
