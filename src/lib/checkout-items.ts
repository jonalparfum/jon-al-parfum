import { prisma } from "@/lib/prisma";

export type CheckoutItem = { productId: string; quantity: number };

export type PreparedCheckout = {
  total: number;
  orderItems: { productId: string; quantity: number; price: number }[];
  products: Awaited<ReturnType<typeof prisma.product.findMany>>;
};

export async function prepareCheckoutItems(
  items: CheckoutItem[]
): Promise<PreparedCheckout> {
  if (!items.length) {
    throw new Error("El carrito está vacío");
  }

  for (const item of items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      throw new Error("Cantidad inválida en el carrito");
    }
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== items.length) {
    throw new Error("Algunos productos ya no están disponibles");
  }

  let total = 0;
  const orderItems = items.map((item) => {
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

  return { total, orderItems, products };
}
