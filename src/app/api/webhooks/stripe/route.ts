import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markOrderPaid, cancelPendingOrder } from "@/lib/order-fulfillment";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await markOrderPaid(orderId, {
          stripePaymentId: session.payment_intent as string,
          shippingName: session.customer_details?.name || null,
          shippingEmail: session.customer_details?.email || null,
          shippingAddress: session.customer_details?.address
            ? JSON.stringify(session.customer_details.address)
            : null,
        });
      } catch (error) {
        console.error("Error al confirmar pedido pagado:", error);
        return NextResponse.json(
          { error: "No se pudo actualizar el pedido" },
          { status: 500 }
        );
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id) {
      await cancelPendingOrder({ stripeSessionId: session.id });
    }
  }

  return NextResponse.json({ received: true });
}
