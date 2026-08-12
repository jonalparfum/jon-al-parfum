"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const modalOnCloseRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      modalOnCloseRef.current = onClose;
      setModal({ message, type });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal(null);
    const callback = modalOnCloseRef.current;
    modalOnCloseRef.current = undefined;
    callback?.();
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, closeModal]);

  const overlay = mounted ? (
    <>
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
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white border border-stone-200 rounded-2xl shadow-2xl z-[9999] p-6 text-center"
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
            <button
              type="button"
              onClick={closeModal}
              className={`${adminBtnPrimary} w-full`}
            >
              Entendido
            </button>
          </div>
        </>
      )}
    </>
  ) : null;

  return (
    <AdminToastContext.Provider value={{ showToast, showActionModal }}>
      {children}
      {overlay && createPortal(overlay, document.body)}
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
