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
  adminBtnPrimary,
  adminToast,
  adminToastError,
  adminToastSuccess,
} from "@/lib/admin-styles";

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

type ActionModalState = {
  message: string;
  type: ToastType;
  onClose?: () => void;
} | null;

const AdminToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
  showActionModal: (
    message: string,
    type?: ToastType,
    onClose?: () => void
  ) => void;
} | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const [modal, setModal] = useState<ActionModalState>(null);
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

  const showActionModal = useCallback(
    (message: string, type: ToastType = "success", onClose?: () => void) => {
      setModal({ message, type, onClose });
    },
    []
  );

  const closeModal = () => {
    const callback = modal?.onClose;
    setModal(null);
    callback?.();
  };

  return (
    <AdminToastContext.Provider value={{ showToast, showActionModal }}>
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
      {modal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[110]"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white border border-stone-200 rounded-2xl shadow-2xl z-[120] p-6 text-center"
            role="dialog"
            aria-modal="true"
            aria-label={modal.message}
          >
            <div
              className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-xl ${
                modal.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {modal.type === "success" ? "✓" : "!"}
            </div>
            <p className="text-charcoal font-medium text-lg mb-6">{modal.message}</p>
            <button type="button" onClick={closeModal} className={`${adminBtnPrimary} w-full`}>
              Entendido
            </button>
          </div>
        </>
      )}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    return { showToast: () => {}, showActionModal: () => {} };
  }
  return ctx;
}
