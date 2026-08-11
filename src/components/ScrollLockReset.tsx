"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resetScrollLock } from "@/lib/scroll-lock";

/** Clears stale body scroll locks after navigation or bfcache restore. */
export default function ScrollLockReset() {
  const pathname = usePathname();

  useEffect(() => {
    resetScrollLock();
  }, [pathname]);

  useEffect(() => {
    resetScrollLock();

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetScrollLock();
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
