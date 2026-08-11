import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  unauthorized,
  parseJsonBody,
} from "@/lib/api-auth";
import { slugify } from "@/lib/product-utils";

type CategoryBody = {
  name: string;
  slug?: string;
  description?: string;
};

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = await parseJsonBody<CategoryBody>(request);
  if (!body?.name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug || slugify(body.name),
      description: body.description || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
