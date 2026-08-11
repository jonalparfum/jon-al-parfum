"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AdminBadgeModule } from "@/lib/admin-notifications";

function moduleFromPath(pathname: string): AdminBadgeModule | null {
  if (pathname.startsWith("/admin/pedidos")) return "pedidos";
  if (pathname.startsWith("/admin/comprobantes")) return "comprobantes";
  if (pathname.startsWith("/admin/usuarios")) return "usuarios";
  return null;
}

export default function AdminModuleSeenMarker() {
  const pathname = usePathname();
  const router = useRouter();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const module = moduleFromPath(pathname);
    const prevModule = prevPathRef.current
      ? moduleFromPath(prevPathRef.current)
      : null;
    prevPathRef.current = pathname;

    if (!module || prevModule === module) return;

    fetch("/api/admin/notifications/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module }),
    })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {});
  }, [pathname, router]);

  return null;
}
