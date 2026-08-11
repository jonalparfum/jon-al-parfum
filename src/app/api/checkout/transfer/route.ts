import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { prepareCheckoutItems } from "@/lib/checkout-items";

type CheckoutBody = {
  items: { productId: string; quantity: number }[];
};

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const body = await parseJsonBody<CheckoutBody>(request);
  if (!body?.items?.length) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  let prepared;
  try {
    prepared = await prepareCheckoutItems(body.items);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error en el checkout" },
      { status: 400 }
    );
  }

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  if (bankAccounts.length === 0) {
    return NextResponse.json(
      { error: "No hay cuentas bancarias configuradas para transferencias" },
      { status: 503 }
    );
  }

  const primaryAccount = bankAccounts[0];

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total: prepared.total,
      status: "PENDING",
      paymentMethod: "BANK_TRANSFER",
      bankAccountId: primaryAccount.id,
      shippingEmail: session.user.email || undefined,
      items: { create: prepared.orderItems },
    },
  });

  return NextResponse.json({
    orderId: order.id,
    total: order.total,
    bankAccounts: bankAccounts.map((a) => ({
      id: a.id,
      bankName: a.bankName,
      accountHolder: a.accountHolder,
      accountNumber: a.accountNumber,
      clabe: a.clabe,
      notes: a.notes,
    })),
  });
}
