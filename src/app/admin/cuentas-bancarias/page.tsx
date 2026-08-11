"use client";

import { useEffect, useState } from "react";
import { useAdminToast } from "@/components/admin/AdminToast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSuccess,
  adminCard,
  adminEmptyState,
  adminInput,
  adminLabel,
  adminLoading,
  adminMuted,
  adminPanelPadding,
} from "@/lib/admin-styles";

type BankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string | null;
  clabe: string | null;
  notes: string | null;
  active: boolean;
};

export default function AdminBankAccountsPage() {
  const { showToast } = useAdminToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [clabe, setClabe] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBankName, setEditBankName] = useState("");
  const [editAccountHolder, setEditAccountHolder] = useState("");
  const [editAccountNumber, setEditAccountNumber] = useState("");
  const [editClabe, setEditClabe] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editActive, setEditActive] = useState(true);

  const load = () => {
    fetchJsonArray<BankAccount>("/api/admin/bank-accounts").then(
      ({ ok, data, error }) => {
        setAccounts(data);
        if (!ok && error) showToast(error, "error");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setBankName("");
    setAccountHolder("");
    setAccountNumber("");
    setClabe("");
    setNotes("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankName,
        accountHolder,
        accountNumber: accountNumber || undefined,
        clabe: clabe || undefined,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      showToast("Cuenta bancaria agregada", "success");
      resetForm();
      load();
    } else {
      showToast(data.error || "Error al guardar", "error");
    }
  };

  const startEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setEditBankName(account.bankName);
    setEditAccountHolder(account.accountHolder);
    setEditAccountNumber(account.accountNumber || "");
    setEditClabe(account.clabe || "");
    setEditNotes(account.notes || "");
    setEditActive(account.active);
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/admin/bank-accounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankName: editBankName,
        accountHolder: editAccountHolder,
        accountNumber: editAccountNumber || null,
        clabe: editClabe || null,
        notes: editNotes || null,
        active: editActive,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      showToast("Cuenta actualizada", "success");
      setEditingId(null);
      load();
    } else {
      showToast(data.error || "Error al actualizar", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta cuenta bancaria?")) return;

    const res = await fetch(`/api/admin/bank-accounts/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showToast("Cuenta eliminada", "success");
      load();
    } else {
      const data = await res.json();
      showToast(data.error || "Error al eliminar", "error");
    }
  };

  if (loading) {
    return <p className={adminLoading}>Cargando cuentas...</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title="Cuentas bancarias"
        subtitle="Datos que verán tus clientes al pagar por transferencia."
      />

      <div className={`${adminCard} ${adminPanelPadding} mb-8`}>
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          Agregar cuenta
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={adminLabel}>Banco *</label>
            <input
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={adminInput}
              placeholder="Ej. BBVA, Santander..."
            />
          </div>
          <div>
            <label className={adminLabel}>Titular *</label>
            <input
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel}>Número de cuenta</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel}>CLABE interbancaria</label>
            <input
              value={clabe}
              onChange={(e) => setClabe(e.target.value)}
              className={adminInput}
              maxLength={18}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={adminLabel}>Notas (opcional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={adminInput}
              placeholder="Ej. Concepto de pago, horario de revisión..."
            />
            <p className={`${adminMuted} mt-2 text-xs`}>
              Indica al menos número de cuenta o CLABE.
            </p>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={adminBtnPrimary}>
              Guardar cuenta
            </button>
          </div>
        </form>
      </div>

      {accounts.length === 0 ? (
        <div className={adminEmptyState}>
          <p>No hay cuentas bancarias. Agrega una para habilitar transferencias.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className={`${adminCard} ${adminPanelPadding}`}>
              {editingId === account.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={adminLabel}>Banco</label>
                    <input
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                  <div>
                    <label className={adminLabel}>Titular</label>
                    <input
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                  <div>
                    <label className={adminLabel}>Número de cuenta</label>
                    <input
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                  <div>
                    <label className={adminLabel}>CLABE</label>
                    <input
                      value={editClabe}
                      onChange={(e) => setEditClabe(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={adminLabel}>Notas</label>
                    <input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      id={`active-${account.id}`}
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <label htmlFor={`active-${account.id}`} className="text-sm">
                      Activa (visible en checkout)
                    </label>
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button
                      onClick={() => handleUpdate(account.id)}
                      className={adminBtnSuccess}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={adminBtnGhost}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-charcoal">
                        {account.bankName}
                      </h3>
                      {!account.active && (
                        <span className="text-xs uppercase tracking-wider text-stone-400 border border-stone-200 px-2 py-0.5 rounded">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-charcoal/70">
                      Titular: {account.accountHolder}
                    </p>
                    {account.accountNumber && (
                      <p className="text-sm text-charcoal/70">
                        Cuenta: {account.accountNumber}
                      </p>
                    )}
                    {account.clabe && (
                      <p className="text-sm text-charcoal/70 font-mono">
                        CLABE: {account.clabe}
                      </p>
                    )}
                    {account.notes && (
                      <p className={`${adminMuted} text-xs mt-2`}>
                        {account.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(account)}
                      className={adminBtnGhost}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className={adminBtnDanger}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
