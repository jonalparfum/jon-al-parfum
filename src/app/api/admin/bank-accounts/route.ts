import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type BankAccountBody = {
  bankName: string;
  accountHolder: string;
  accountNumber?: string;
  clabe?: string;
  notes?: string;
  active?: boolean;
};

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const accounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = await parseJsonBody<BankAccountBody>(request);

  if (!body?.bankName?.trim() || !body?.accountHolder?.trim()) {
    return NextResponse.json(
      { error: "Banco y titular son obligatorios" },
      { status: 400 }
    );
  }

  if (!body.accountNumber?.trim() && !body.clabe?.trim()) {
    return NextResponse.json(
      { error: "Indica número de cuenta o CLABE" },
      { status: 400 }
    );
  }

  const account = await prisma.bankAccount.create({
    data: {
      bankName: body.bankName.trim(),
      accountHolder: body.accountHolder.trim(),
      accountNumber: body.accountNumber?.trim() || null,
      clabe: body.clabe?.trim() || null,
      notes: body.notes?.trim() || null,
      active: body.active ?? true,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
