"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { fetchJson } from "@/lib/admin-fetch";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  adminBtnPrimary,
  adminInput,
  adminLabel,
  adminLoading,
  adminMuted,
  adminPanelPadding,
  adminSectionTitle,
} from "@/lib/admin-styles";
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/password-policy";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchJson<Profile>("/api/admin/profile").then(({ ok, data, error }) => {
      if (ok && data?.id) {
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email);
      } else if (error) {
        setError(error);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setSaving(true);

    const payload: Record<string, string> = {};
    if (name !== (profile?.name || "")) payload.name = name;
    if (email !== profile?.email) payload.email = email;
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }

    setProfile(data.user);
    setMessage(data.message || "Perfil actualizado");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (payload.email || payload.newPassword) {
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 2000);
    }
  };

  if (loading) return <p className={adminLoading}>Cargando perfil...</p>;

  return (
    <div>
      <AdminPageHeader
        title="Mi perfil"
        subtitle="Personaliza tu nombre, email y contraseña de administrador."
      />

      <form
        onSubmit={handleSubmit}
        className={`${adminPanelPadding} max-w-xl space-y-5`}
      >
        {error && (
          <p className="text-red-700 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-800 text-sm bg-green-50 border border-green-200 px-3 py-2 rounded">
            {message}
          </p>
        )}

        <div>
          <label className={adminLabel}>Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={adminInput}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className={adminLabel}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={adminInput}
          />
        </div>

        <div className="pt-6 border-t border-stone-200 space-y-4">
          <p className={`${adminSectionTitle} text-base`}>Cambiar contraseña</p>
          <p className={adminMuted}>
            Déjalo en blanco si no quieres cambiarla.
          </p>

          <div>
            <label className={adminLabel}>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={adminInput}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className={adminLabel}>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={adminInput}
              autoComplete="new-password"
              minLength={8}
            />
            <p className="mt-1 text-xs text-charcoal/45">{PASSWORD_REQUIREMENTS_HINT}</p>
          </div>

          <div>
            <label className={adminLabel}>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={adminInput}
              autoComplete="new-password"
              minLength={8}
            />
          </div>
        </div>

        {profile && (
          <p className={adminMuted}>
            Administrador desde{" "}
            {new Date(profile.createdAt).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`${adminBtnPrimary} disabled:opacity-50`}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
