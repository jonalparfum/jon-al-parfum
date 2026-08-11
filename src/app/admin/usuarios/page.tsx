"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { fetchJsonArray } from "@/lib/admin-fetch";
import {
  adminBadgeActive,
  adminBadgeInactive,
  adminEmptyState,
  adminFilterGroup,
  adminFilterPill,
  adminFilterPillActive,
  adminFilterPillInactive,
  adminInput,
  adminLabel,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanel,
  adminSubtitle,
  adminTableHead,
  adminTd,
  adminTdMuted,
  adminTh,
  adminTr,
} from "@/lib/admin-styles";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { orders: number };
};

const roleLabels = {
  USER: "Cliente",
  ADMIN: "Administrador",
};

export default function AdminUsersPage() {
  const { showToast } = useAdminToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");

  useEffect(() => {
    fetchJsonArray<UserRow>("/api/admin/users").then(({ ok, data, error }) => {
      setUsers(data);
      if (!ok && error) showToast(error, "error");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name?.toLowerCase().includes(q) ?? false)
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  if (loading) return <p className={adminLoading}>Cargando usuarios...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className={adminPageTitle}>Usuarios</h1>
        <p className={adminSubtitle}>
          {filtered.length} de {users.length} registrados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
        <div>
          <label className={adminLabel}>Buscar</label>
          <input
            type="search"
            placeholder="Nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={adminInput}
          />
        </div>
      </div>

      <div className={`${adminFilterGroup} mb-6`}>
        {(
          [
            ["all", "Todos"],
            ["USER", "Clientes"],
            ["ADMIN", "Administradores"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRoleFilter(value)}
            className={`${adminFilterPill} ${
              roleFilter === value
                ? adminFilterPillActive
                : adminFilterPillInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={adminEmptyState}>
          <p className="text-cream/70">
            {users.length === 0
              ? "Aún no hay usuarios registrados."
              : "Ningún usuario coincide con la búsqueda."}
          </p>
        </div>
      ) : (
        <div className={adminPanel}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTh}>Nombre</th>
                  <th className={adminTh}>Email</th>
                  <th className={adminTh}>Rol</th>
                  <th className={adminTh}>Pedidos</th>
                  <th className={adminTh}>Registro</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={adminTr}>
                    <td className={adminTd}>
                      <span className="font-medium text-cream">
                        {user.name || "—"}
                      </span>
                    </td>
                    <td className={adminTd}>{user.email}</td>
                    <td className={adminTd}>
                      <span
                        className={
                          user.role === "ADMIN"
                            ? adminBadgeActive
                            : adminBadgeInactive
                        }
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className={adminTd}>{user._count.orders}</td>
                    <td className={adminTdMuted}>
                      {new Date(user.createdAt).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
