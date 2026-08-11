import { NextRequest, NextResponse } from "next/server";
import { WHATSAPP_NUMBER } from "@/lib/contact";

export async function POST(request: NextRequest) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() || "No indicado";
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Nombre, email y mensaje son obligatorios" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  const whatsappText = [
    "Hola Jon Al Parfum,",
    "",
    `*Nombre:* ${name}`,
    `*Email:* ${email}`,
    `*Teléfono:* ${phone}`,
    "",
    `*Mensaje:*`,
    message,
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  return NextResponse.json({ ok: true, whatsappUrl });
}
