"use client";

import { useState } from "react";
import { adminBtnGhost, adminBtnPrimary } from "@/lib/admin-styles";

export default function DownloadReportButton() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/report/pdf");
      if (!res.ok) {
        alert("No se pudo generar el reporte PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jon-al-parfum-reporte-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error al descargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/report/pdf");
      if (!res.ok) {
        alert("No se pudo generar el reporte PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      alert("Error al abrir el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handlePreview}
        disabled={loading}
        className={`${adminBtnGhost} disabled:opacity-50`}
      >
        {loading ? "Generando…" : "Ver PDF"}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={`${adminBtnPrimary} disabled:opacity-50`}
      >
        {loading ? "Generando…" : "Descargar PDF"}
      </button>
    </div>
  );
}
