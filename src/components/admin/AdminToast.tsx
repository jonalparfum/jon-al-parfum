"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  adminToast,
  adminToastError,
  adminToastSuccess,
} from "@/lib/admin-styles";

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

const AdminToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
} | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`${adminToast} ${
            toast.type === "success" ? adminToastSuccess : adminToastError
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
