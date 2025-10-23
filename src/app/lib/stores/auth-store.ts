"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens, AuthUser } from "../types";

interface AuthState extends Partial<AuthTokens> {
  user: AuthUser | null;
  isHydrated: boolean;
  setAuth: (tokens: AuthTokens & { user?: AuthUser }) => void;
  clearAuth: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: false,
      setAuth: ({ accessToken, refreshToken, user }) =>
        set((state) => ({
          accessToken,
          refreshToken,
          user: user ?? state.user ?? null,
        })),
      clearAuth: () =>
        set(() => ({
          accessToken: null,
          refreshToken: null,
          user: null,
        })),
      markHydrated: () =>
        set(() => ({
          isHydrated: true,
        })),
    }),
    {
      name: "bigs-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ accessToken, refreshToken, user }) => ({
        accessToken,
        refreshToken,
        user,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
