import { create } from 'zustand';
import type { User } from '@/app/types/users';

interface AuthState {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => void;
    initialize: () => void;
}

// サンプルユーザー
const sampleUser: User = {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: false,
    signIn: async (email, password) => {
        set({ loading: true });
        // 簡易的な認証
        if (email === sampleUser.email && password === 'password') {
            set({ user: sampleUser, loading: false });
        } else {
            set({ loading: false });
            throw new Error('Invalid credentials');
        }
    },
    signUp: async (email, password, name) => {
        set({ loading: true });
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        set({ user: newUser, loading: false });
    },
    signOut: () => {
        set({ user: null });
    },
    initialize: () => {
        // ローカルストレージからユーザー情報を復元する場合はここで実装
        set({ loading: false });
    },
}));
