import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserInfo, LoginResult } from '@/types/auth';

interface AuthStore extends AuthState {
  login: (result: LoginResult) => void;
  logout: () => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isLoggedIn: false,
      login: (result) => {
        console.log('[Auth] Login success', result.userInfo.name);
        set({
          token: result.token,
          userInfo: result.userInfo,
          isLoggedIn: true,
        });
      },
      logout: () => {
        console.log('[Auth] Logout');
        set({
          token: null,
          userInfo: null,
          isLoggedIn: false,
        });
      },
      updateUserInfo: (info) =>
        set((state) => ({
          userInfo: state.userInfo ? { ...state.userInfo, ...info } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
