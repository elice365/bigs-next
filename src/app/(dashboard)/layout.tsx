"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "../components/layout/app-shell";
import { useAuthStore } from "../lib/stores/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && !accessToken) {
      router.replace("/signin");
    }
  }, [accessToken, isHydrated, router]);

  if (isHydrated && !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-sm">Redirecting to sign-in…</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
