"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type PropsWithChildren, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../lib/stores/auth-store";
import { cn } from "../../lib/utils";

const navigation = [
  { href: "/boards", label: "Boards" },
  { href: "/boards/create", label: "Create" },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const greeting = useMemo(() => {
    if (!user) return null;
    const name = user.name ?? "";
    const username = user.username ?? "";
    if (name && username) {
      return `${name} (${username})`;
    }
    return name || username || null;
  }, [user]);

  const handleSignOut = () => {
    clearAuth();
    router.replace("/signin");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/boards" className="text-lg font-semibold text-slate-900">
            BIGS Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            {navigation.map((item) => {
              const isActive =
                item.href === "/boards"
                  ? pathname === "/boards" ||
                    (!!pathname &&
                      pathname.startsWith("/boards/") &&
                      !pathname.startsWith("/boards/create"))
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-slate-900",
                    isActive && "text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {greeting ? (
              <div className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {greeting}
              </div>
            ) : null}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
