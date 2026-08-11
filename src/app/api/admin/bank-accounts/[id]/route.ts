import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

type BankAccountBody = {
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string | null;
  clabe?: string | null;
  notes?: string | null;
  active?: boolean;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const body = await parseJsonBody<BankAccountBody>(request);

  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const existing = await prisma.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  const bankName = body.bankName?.trim() ?? existing.bankName;
  const accountHolder = body.accountHolder?.trim() ?? existing.accountHolder;
  const accountNumber =
    body.accountNumber !== undefined
      ? body.accountNumber?.trim() || null
      : existing.accountNumber;
  const clabe =
    body.clabe !== undefined ? body.clabe?.trim() || null : existing.clabe;

  if (!accountNumber && !clabe) {
    return NextResponse.json(
      { error: "Indica número de cuenta o CLABE" },
      { status: 400 }
    );
  }

  const account = await prisma.bankAccount.update({
    where: { id },
    data: {
      bankName,
      accountHolder,
      accountNumber,
      clabe,
      notes:
        body.notes !== undefined
          ? body.notes?.trim() || null
          : existing.notes,
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  return NextResponse.json(account);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;

  const existing = await prisma.bankAccount.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  await prisma.bankAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
