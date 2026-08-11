"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
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
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    setToast({ message, type });
    timeoutRef.current = window.setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, 3200);
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
