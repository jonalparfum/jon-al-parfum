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
