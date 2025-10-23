"use client";

import { type PropsWithChildren, useEffect } from "react";
import { useAuthStore } from "../lib/stores/auth-store";

export function AppProviders({ children }: PropsWithChildren) {
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-sm">Preparing application…</p>
      </div>
    );
  }

  return children;
}
