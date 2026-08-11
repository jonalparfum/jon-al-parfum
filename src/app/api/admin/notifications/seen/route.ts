import { NextRequest, NextResponse } from "next/server";
import {
  markAdminModuleSeen,
  type AdminBadgeModule,
} from "@/lib/admin-notifications";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";

type SeenBody = { module?: AdminBadgeModule };

const VALID_MODULES = new Set<AdminBadgeModule>([
  "pedidos",
  "comprobantes",
  "usuarios",
]);

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session?.user?.id) return unauthorized();

  const body = await parseJsonBody<SeenBody>(request);
  if (!body?.module || !VALID_MODULES.has(body.module)) {
    return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
  }

  await markAdminModuleSeen(session.user.id, body.module);

  return NextResponse.json({ ok: true });
}
