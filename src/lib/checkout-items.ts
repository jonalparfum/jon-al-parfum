import { prisma } from "@/lib/prisma";

export type CheckoutItem = {
  productId: string;
  quantity: number;
  variantId?: string;
};

export type PreparedCheckout = {
  total: number;
  orderItems: {
    productId: string;
    quantity: number;
    price: number;
    variantId?: string;
    variantLabel?: string;
  }[];
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

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    include: {
      variants: { where: { active: true } },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("Algunos productos ya no están disponibles");
  }

  let total = 0;
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new Error(`Tamaño no disponible para ${product.name}`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name} (${variant.label})`);
      }
      total += variant.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: variant.price,
        variantId: variant.id,
        variantLabel: variant.label,
      };
    }

    if (product.variants.length > 0) {
      throw new Error(`Selecciona un tamaño para ${product.name}`);
    }

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
