"use client";

import { useEffect, useState } from "react";
import {
  adminBadgeActive,
  adminBadgeInactive,
  adminLoading,
  adminMuted,
  adminPageTitle,
  adminPanel,
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
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={adminLoading}>Cargando usuarios...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className={adminPageTitle}>Usuarios registrados</h1>
        <p className={`${adminMuted} mt-2`}>
          {users.length} persona{users.length === 1 ? "" : "s"} registrada
          {users.length === 1 ? "" : "s"} en la tienda.
        </p>
      </div>

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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${adminTdMuted} p-8 text-center`}>
                    Aún no hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
