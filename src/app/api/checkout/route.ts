import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorized, parseJsonBody } from "@/lib/api-auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { STRIPE_MIN_MXN } from "@/lib/stripe-limits";
import { prepareCheckoutItems } from "@/lib/checkout-items";
import {
  normalizeShipping,
  shippingToOrderFields,
  validateShipping,
  type ShippingInput,
} from "@/lib/shipping";

type CheckoutBody = {
  items: { productId: string; quantity: number; variantId?: string }[];
  shipping?: ShippingInput;
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

  let prepared;
  try {
    prepared = await prepareCheckoutItems(body.items);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error en el checkout" },
      { status: 400 }
    );
  }

  if (prepared.total < STRIPE_MIN_MXN) {
    return NextResponse.json(
      {
        error: `El monto mínimo para pagar con tarjeta es ${STRIPE_MIN_MXN} MXN (límite de Stripe). Tu carrito suma ${prepared.total} MXN.`,
      },
      { status: 400 }
    );
  }

  const shippingError = validateShipping(body.shipping ?? {});
  if (shippingError) {
    return NextResponse.json({ error: shippingError }, { status: 400 });
  }

  const shippingFields = shippingToOrderFields(
    normalizeShipping(body.shipping!),
    session.user.email
  );

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total: prepared.total,
      status: "PENDING",
      paymentMethod: "STRIPE",
      ...shippingFields,
      items: { create: prepared.orderItems },
    },
  });

  const lineItems = prepared.orderItems.map((item) => {
    const product = prepared.products.find((p) => p.id === item.productId)!;
    const imageUrl = product.image.startsWith("http")
      ? product.image
      : `${process.env.NEXT_PUBLIC_APP_URL}${product.image}`;
    const label = item.variantLabel
      ? `${product.name} (${item.variantLabel})`
      : product.name;

    return {
      price_data: {
        currency: "mxn",
        product_data: {
          name: label,
          description: product.description.slice(0, 200),
          images: [imageUrl],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: session.user.email || undefined,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
