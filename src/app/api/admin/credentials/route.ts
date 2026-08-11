import {
  formatCredentialsExport,
  getAdminCredentials,
} from "@/lib/admin-credentials";
import { requireAdmin, unauthorized } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const entries = getAdminCredentials();
  const download = request.nextUrl.searchParams.get("download") === "1";

  if (download) {
    const body = formatCredentialsExport(entries);
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="jon-al-parfum-accesos-${date}.txt"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ entries });
}
