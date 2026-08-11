"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import { fetchJson } from "@/lib/admin-fetch";
import {
  adminBtnPrimary,
  adminEmptyState,
  adminLink,
  adminLoading,
  adminMuted,
  adminPanel,
  adminTableHead,
  adminTd,
  adminTh,
  adminTr,
} from "@/lib/admin-styles";

type CredentialEntry = {
  id: string;
  name: string;
  url: string;
  email: string;
  password: string;
  authNote?: string;
};

export default function AdminAccesosPage() {
  const { showToast } = useAdminToast();
  const [entries, setEntries] = useState<CredentialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchJson<{ entries: CredentialEntry[] }>("/api/admin/credentials").then(
      ({ ok, data, error }) => {
        if (ok && data?.entries) {
          setEntries(data.entries);
        } else if (error) {
          showToast(error, "error");
        }
        setLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/credentials?download=1");
      if (!res.ok) {
        showToast("No se pudo generar el archivo", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jon-al-parfum-accesos-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Accesos descargados");
    } catch {
      showToast("Error al descargar", "error");
    } finally {
      setDownloading(false);
    }
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <p className={adminLoading}>Cargando accesos...</p>;

  const configured = entries.filter((e) => e.email && e.password).length;

  return (
    <div>
      <AdminPageHeader
        title="Accesos a servicios"
        subtitle="Correo y contraseña de inicio de sesión (sin claves API). Solo visible para administradores."
      >
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={`${adminBtnPrimary} disabled:opacity-50`}
        >
          {downloading ? "Generando…" : "Descargar credenciales"}
        </button>
      </AdminPageHeader>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Uso privado.</strong> Estas contraseñas se cargan desde variables de
        entorno en Vercel (no se guardan en el código). No compartas el archivo
        descargado. Si falta un servicio, agrega las variables{" "}
        <code className="text-xs">ADMIN_CRED_*</code> en Vercel y redeploy.
      </div>

      {configured === 0 ? (
        <div className={adminEmptyState}>
          <p className="text-charcoal/70 mb-2">
            Aún no hay credenciales configuradas en el servidor.
          </p>
          <p className={`${adminMuted} text-xs max-w-lg mx-auto`}>
            En Vercel → Settings → Environment Variables agrega por ejemplo{" "}
            <code>ADMIN_CRED_GMAIL_EMAIL</code>,{" "}
            <code>ADMIN_CRED_GMAIL_PASSWORD</code>, etc., luego redeploy.
          </p>
        </div>
      ) : (
        <div className={adminPanel}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTh}>Servicio</th>
                  <th className={adminTh}>Correo</th>
                  <th className={adminTh}>Contraseña</th>
                  <th className={adminTh}>2FA / notas</th>
                  <th className={adminTh}>Panel</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className={adminTr}>
                    <td className={adminTd}>
                      <span className="font-medium text-charcoal">{entry.name}</span>
                    </td>
                    <td className={adminTd}>
                      {entry.email || (
                        <span className="text-charcoal/40">No configurado</span>
                      )}
                    </td>
                    <td className={adminTd}>
                      {entry.password ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {visiblePasswords[entry.id]
                              ? entry.password
                              : "••••••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePassword(entry.id)}
                            className="text-[10px] uppercase tracking-wider text-gold-dark hover:text-gold"
                          >
                            {visiblePasswords[entry.id] ? "Ocultar" : "Ver"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-charcoal/40">No configurado</span>
                      )}
                    </td>
                    <td className={adminTd}>
                      {entry.authNote ? (
                        <span className="font-mono text-xs">{entry.authNote}</span>
                      ) : (
                        <span className="text-charcoal/40">—</span>
                      )}
                    </td>
                    <td className={adminTd}>
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={adminLink}
                      >
                        Abrir
                      </a>
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
