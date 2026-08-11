"use client";

import { useEffect } from "react";

/** Overrides store dark body styles while the admin panel is mounted. */
export default function AdminBodyTheme() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    body.classList.add("admin-panel-active");
    html.classList.add("admin-panel-active");

    return () => {
      body.classList.remove("admin-panel-active");
      html.classList.remove("admin-panel-active");
    };
  }, []);

  return null;
}
