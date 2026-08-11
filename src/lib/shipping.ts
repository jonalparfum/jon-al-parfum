export type ShippingInput = {
  shippingName: string;
  shippingPhone: string;
  shippingStreet: string;
  shippingColony?: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingNotes?: string;
};

export type ShippingRecord = ShippingInput & {
  shippingEmail?: string | null;
};

export function validateShipping(data: Partial<ShippingInput>): string | null {
  if (!data.shippingName?.trim()) {
    return "El nombre de quien recibe el paquete es obligatorio";
  }
  if (!data.shippingPhone?.trim()) {
    return "El número de WhatsApp es obligatorio";
  }
  const phoneDigits = data.shippingPhone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return "Ingresa un número de WhatsApp válido (10 dígitos)";
  }
  if (!data.shippingStreet?.trim()) {
    return "El domicilio es obligatorio";
  }
  if (!data.shippingCity?.trim()) return "La ciudad es obligatoria";
  if (!data.shippingState?.trim()) return "El estado es obligatorio";
  if (!data.shippingZip?.trim()) return "El código postal es obligatorio";
  if (!/^\d{5}$/.test(data.shippingZip.trim())) {
    return "El código postal debe tener 5 dígitos";
  }
  return null;
}

export function normalizeShipping(data: ShippingInput): ShippingInput {
  return {
    shippingName: data.shippingName.trim(),
    shippingPhone: data.shippingPhone.trim(),
    shippingStreet: data.shippingStreet.trim(),
    shippingColony: data.shippingColony?.trim() || undefined,
    shippingCity: data.shippingCity.trim(),
    shippingState: data.shippingState.trim(),
    shippingZip: data.shippingZip.trim(),
    shippingNotes: data.shippingNotes?.trim() || undefined,
  };
}

export function formatShippingAddress(data: Partial<ShippingRecord>): string {
  const parts = [
    data.shippingStreet,
    data.shippingColony,
    [data.shippingCity, data.shippingState, data.shippingZip].filter(Boolean).join(", "),
    data.shippingPhone ? `WhatsApp: ${data.shippingPhone}` : null,
    data.shippingNotes,
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Detecta JSON de dirección vacío que Stripe guarda en checkout sin envío. */
export function isUselessShippingAddress(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return false;
    const hasContent = ["line1", "line2", "city", "state", "postal_code"].some(
      (key) => {
        const v = parsed[key];
        return v != null && String(v).trim() !== "";
      }
    );
    return !hasContent;
  } catch {
    return false;
  }
}

export type OrderShippingFields = {
  shippingName?: string | null;
  shippingStreet?: string | null;
  shippingColony?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingZip?: string | null;
  shippingPhone?: string | null;
  shippingNotes?: string | null;
  shippingAddress?: string | null;
};

/** Texto legible para mostrar envío en cuenta/admin (ignora JSON de Stripe). */
export function resolveOrderShippingDisplay(order: OrderShippingFields): string {
  const fromFields = formatShippingAddress({
    shippingStreet: order.shippingStreet ?? undefined,
    shippingColony: order.shippingColony ?? undefined,
    shippingCity: order.shippingCity ?? undefined,
    shippingState: order.shippingState ?? undefined,
    shippingZip: order.shippingZip ?? undefined,
    shippingPhone: order.shippingPhone ?? undefined,
    shippingNotes: order.shippingNotes ?? undefined,
  });

  if (fromFields) return fromFields;

  if (order.shippingAddress && !isUselessShippingAddress(order.shippingAddress)) {
    return order.shippingAddress;
  }

  return "";
}

export function shippingToOrderFields(
  data: ShippingInput,
  email?: string | null
) {
  const normalized = normalizeShipping(data);
  return {
    shippingName: normalized.shippingName,
    shippingEmail: email ?? null,
    shippingPhone: normalized.shippingPhone,
    shippingStreet: normalized.shippingStreet,
    shippingColony: normalized.shippingColony ?? null,
    shippingCity: normalized.shippingCity,
    shippingState: normalized.shippingState,
    shippingZip: normalized.shippingZip,
    shippingNotes: normalized.shippingNotes ?? null,
    shippingAddress: formatShippingAddress({ ...normalized, shippingEmail: email }),
  };
}

export function shippingToUserFields(data: ShippingInput) {
  const normalized = normalizeShipping(data);
  return {
    shippingPhone: normalized.shippingPhone,
    shippingStreet: normalized.shippingStreet,
    shippingColony: normalized.shippingColony ?? null,
    shippingCity: normalized.shippingCity,
    shippingState: normalized.shippingState,
    shippingZip: normalized.shippingZip,
    shippingNotes: normalized.shippingNotes ?? null,
  };
}

export const emptyShipping = (): ShippingInput => ({
  shippingName: "",
  shippingPhone: "",
  shippingStreet: "",
  shippingColony: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  shippingNotes: "",
});
