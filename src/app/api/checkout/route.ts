import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";

type CheckoutBody = {
  items: { productId: string; quantity: number }[];
};

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe no está configurado. Añade las claves en .env" },
      { status: 503 }
    );
  }

  const body = await parseJsonBody<CheckoutBody>(request);
  if (!body?.items?.length) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  for (const item of body.items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      return NextResponse.json(
        { error: "Cantidad inválida en el carrito" },
        { status: 400 }
      );
    }
  }

  const productIds = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== body.items.length) {
    return NextResponse.json(
      { error: "Algunos productos ya no están disponibles" },
      { status: 400 }
    );
  }

  let total = 0;
  let orderItems: { productId: string; quantity: number; price: number }[];

  try {
    orderItems = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }
      total += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error en el checkout" },
      { status: 400 }
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total,
      status: "PENDING",
      shippingEmail: session.user.email || undefined,
      items: { create: orderItems },
    },
  });

  const lineItems = body.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const imageUrl = product.image.startsWith("http")
      ? product.image
      : `${process.env.NEXT_PUBLIC_APP_URL}${product.image}`;

    return {
      price_data: {
        currency: "mxn",
        product_data: {
          name: product.name,
          description: product.description.slice(0, 200),
          images: [imageUrl],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    customer_email: session.user.email || undefined,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
