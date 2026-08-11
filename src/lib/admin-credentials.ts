export type AdminCredentialEntry = {
  id: string;
  name: string;
  url: string;
  email: string;
  password: string;
  authNote?: string;
};

/** Login credentials for external services — loaded from env vars only (never commit values). */
export function getAdminCredentials(): AdminCredentialEntry[] {
  return [
    {
      id: "gmail",
      name: "Gmail",
      url: "https://mail.google.com",
      email: process.env.ADMIN_CRED_GMAIL_EMAIL ?? "",
      password: process.env.ADMIN_CRED_GMAIL_PASSWORD ?? "",
    },
    {
      id: "stripe",
      name: "Stripe (panel)",
      url: "https://dashboard.stripe.com",
      email: process.env.ADMIN_CRED_STRIPE_EMAIL ?? "",
      password: process.env.ADMIN_CRED_STRIPE_PASSWORD ?? "",
      authNote: process.env.ADMIN_CRED_STRIPE_AUTH ?? "",
    },
    {
      id: "vercel",
      name: "Vercel",
      url: "https://vercel.com",
      email: process.env.ADMIN_CRED_VERCEL_EMAIL ?? "",
      password: process.env.ADMIN_CRED_VERCEL_PASSWORD ?? "",
    },
    {
      id: "supabase",
      name: "Supabase",
      url: "https://supabase.com/dashboard/project/qsbckliglejhyzeoymym",
      email: process.env.ADMIN_CRED_SUPABASE_EMAIL ?? "",
      password: process.env.ADMIN_CRED_SUPABASE_PASSWORD ?? "",
    },
    {
      id: "github",
      name: "GitHub",
      url: "https://github.com/jonalparfum/jon-al-parfum",
      email: process.env.ADMIN_CRED_GITHUB_EMAIL ?? "",
      password: process.env.ADMIN_CRED_GITHUB_PASSWORD ?? "",
    },
  ];
}

export function formatCredentialsExport(entries: AdminCredentialEntry[]): string {
  const lines = [
    "Jon Al Parfum — Accesos de servicios",
    "CONFIDENCIAL — Solo administrador",
    `Generado: ${new Date().toLocaleString("es-MX")}`,
    "",
  ];

  for (const entry of entries) {
    lines.push(`── ${entry.name} ──`);
    lines.push(`URL: ${entry.url}`);
    lines.push(`Correo: ${entry.email || "(no configurado)"}`);
    lines.push(`Contraseña: ${entry.password || "(no configurado)"}`);
    if (entry.authNote) {
      lines.push(`Autenticación 2FA / respaldo: ${entry.authNote}`);
    }
    lines.push("");
  }

  lines.push("No incluye claves API (Stripe, Vercel, Supabase). Esas están en cada panel.");
  return lines.join("\n");
}
