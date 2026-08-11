"use client";

import type { ShippingInput } from "@/lib/shipping";

const inputClass =
  "w-full bg-luxury-black border border-gold/20 px-3 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors";

const labelClass = "block text-sm font-medium mb-1 text-cream/80";

type ShippingAddressFormProps = {
  value: ShippingInput;
  onChange: (value: ShippingInput) => void;
  variant?: "dark" | "light";
  showNameField?: boolean;
  showIntro?: boolean;
};

export default function ShippingAddressForm({
  value,
  onChange,
  variant = "dark",
  showNameField = true,
  showIntro = false,
}: ShippingAddressFormProps) {
  const fieldClass =
    variant === "light"
      ? "w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
      : inputClass;
  const introClass =
    variant === "light" ? "text-sm text-charcoal/60" : "text-sm text-cream/60";
  const lbl = variant === "light" ? "block text-sm font-medium mb-1 text-charcoal" : labelClass;

  const set = (key: keyof ShippingInput, v: string) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      {showIntro && (
        <p className={introClass}>
          Indica tu <strong className="font-medium">nombre</strong>,{" "}
          <strong className="font-medium">número de WhatsApp</strong> y{" "}
          <strong className="font-medium">domicilio</strong> para que podamos
          enviarte tu paquete.
        </p>
      )}

      {showNameField && (
        <div>
          <label className={lbl}>Nombre (quien recibe el paquete) *</label>
          <input
            required
            value={value.shippingName}
            onChange={(e) => set("shippingName", e.target.value)}
            className={fieldClass}
            placeholder="Nombre y apellidos"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <label className={lbl}>Número de WhatsApp *</label>
        <input
          required
          type="tel"
          inputMode="tel"
          value={value.shippingPhone}
          onChange={(e) => set("shippingPhone", e.target.value.replace(/[^\d+\s()-]/g, ""))}
          className={fieldClass}
          placeholder="10 dígitos (ej. 6141234567)"
          autoComplete="tel"
        />
        <p className={`mt-1 text-[11px] ${variant === "light" ? "text-charcoal/45" : "text-cream/40"}`}>
          Lo usamos para avisarte sobre tu envío.
        </p>
      </div>

      <div>
        <label className={lbl}>Domicilio (calle, número, depto.) *</label>
        <input
          required
          value={value.shippingStreet}
          onChange={(e) => set("shippingStreet", e.target.value)}
          className={fieldClass}
          placeholder="Av. Example 123, Depto 4"
          autoComplete="street-address"
        />
      </div>

      <div>
        <label className={lbl}>Colonia</label>
        <input
          value={value.shippingColony || ""}
          onChange={(e) => set("shippingColony", e.target.value)}
          className={fieldClass}
          placeholder="Colonia o fraccionamiento"
          autoComplete="address-level3"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Ciudad *</label>
          <input
            required
            value={value.shippingCity}
            onChange={(e) => set("shippingCity", e.target.value)}
            className={fieldClass}
            autoComplete="address-level2"
          />
        </div>
        <div>
          <label className={lbl}>Estado *</label>
          <input
            required
            value={value.shippingState}
            onChange={(e) => set("shippingState", e.target.value)}
            className={fieldClass}
            placeholder="Ej. Chihuahua"
            autoComplete="address-level1"
          />
        </div>
      </div>

      <div>
        <label className={lbl}>Código postal *</label>
        <input
          required
          inputMode="numeric"
          maxLength={5}
          value={value.shippingZip}
          onChange={(e) => set("shippingZip", e.target.value.replace(/\D/g, ""))}
          className={fieldClass}
          placeholder="5 dígitos"
          autoComplete="postal-code"
        />
      </div>

      <div>
        <label className={lbl}>Referencias de entrega</label>
        <textarea
          rows={2}
          value={value.shippingNotes || ""}
          onChange={(e) => set("shippingNotes", e.target.value)}
          className={fieldClass}
          placeholder="Entre calles, color de casa, horario preferido..."
        />
      </div>
    </div>
  );
}
