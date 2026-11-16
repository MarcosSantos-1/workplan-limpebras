"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground shadow-sm">
          {loading ? "Carregando acesso..." : "Abrindo a tela de login…"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <Sidebar collapsed={collapsed} />
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="sidebar-toggle fixed left-3 top-3 z-50 flex items-center justify-center rounded-md border border-border bg-card/95 p-1.5 text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground print:hidden"
        aria-label={collapsed ? "Mostrar barra lateral" : "Ocultar barra lateral"}
      >
        <Menu className="h-5 w-5" />
      </button>
      <main
        className={
          collapsed
            ? "relative ml-0 w-full overflow-x-hidden transition-all duration-300"
            : "relative ml-72 w-[calc(100%-288px)] overflow-x-hidden transition-all duration-300 max-[1440px]:ml-60 max-[1440px]:w-[calc(100%-240px)]"
        }
      >
        <div className="grid-pattern absolute inset-0 -z-10" />
        <div className="min-w-0 space-y-6 p-6">{children}</div>
      </main>
    </div>
  );
}
