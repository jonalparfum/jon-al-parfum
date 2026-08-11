"use client";

import { useState, useRef } from "react";
import { formatPrice } from "@/lib/product-utils";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { useEffect } from "react";

type BankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string | null;
  clabe: string | null;
  notes: string | null;
};

type TransferCheckoutModalProps = {
  orderId: string;
  total: number;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function TransferCheckoutModal({
  orderId,
  total,
  bankAccounts,
  onClose,
  onSuccess,
}: TransferCheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lockScroll();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Selecciona un comprobante (imagen o PDF)");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(`/api/orders/${orderId}/proof`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      onSuccess();
    } else {
      setError(data.error || "Error al subir el comprobante");
      setUploading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-luxury-panel border border-gold/20 z-[70] rounded-sm shadow-2xl text-cream max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-label="Pago por transferencia"
      >
        <div className="flex items-center justify-between p-5 border-b border-gold/10">
          <h2 className="font-display text-lg">
            {step === 1 ? "Datos bancarios" : "Adjuntar comprobante"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:text-gold transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex justify-between text-sm bg-black/30 border border-gold/10 px-4 py-3 rounded-sm">
            <span className="text-cream/60">Total a transferir</span>
            <span className="font-medium text-gold">{formatPrice(total)}</span>
          </div>

          {step === 1 ? (
            <>
              <p className="text-sm text-cream/60">
                Realiza la transferencia a una de estas cuentas. Luego continúa
                para adjuntar tu comprobante.
              </p>
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border border-gold/15 rounded-sm p-4 space-y-2 text-sm"
                  >
                    <p className="font-medium text-gold">{account.bankName}</p>
                    <p>
                      <span className="text-cream/50">Titular: </span>
                      {account.accountHolder}
                    </p>
                    {account.accountNumber && (
                      <p>
                        <span className="text-cream/50">Cuenta: </span>
                        {account.accountNumber}
                      </p>
                    )}
                    {account.clabe && (
                      <p>
                        <span className="text-cream/50">CLABE: </span>
                        <span className="font-mono tracking-wide">
                          {account.clabe}
                        </span>
                      </p>
                    )}
                    {account.notes && (
                      <p className="text-cream/50 text-xs pt-1">
                        {account.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gold text-luxury-black py-3 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors font-medium"
              >
                Siguiente
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-cream/60">
                Sube la captura o PDF de tu transferencia. Revisaremos tu pago
                y te confirmaremos por correo.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
                className="hidden"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] ?? null);
                  setError("");
                }}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-gold/30 py-8 text-sm text-cream/70 hover:border-gold/60 hover:text-cream transition-colors rounded-sm"
              >
                {selectedFile
                  ? selectedFile.name
                  : "Seleccionar imagen o PDF (máx. 10MB)"}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={uploading}
                  className="flex-1 border border-gold/20 py-3 text-sm uppercase tracking-wider hover:border-gold transition-colors disabled:opacity-50"
                >
                  Atrás
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="flex-1 bg-gold text-luxury-black py-3 text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50 font-medium"
                >
                  {uploading ? "Enviando..." : "Enviar comprobante"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
