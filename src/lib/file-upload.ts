import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

let adminClient: SupabaseClient | null | undefined;

function getSupabaseAdmin(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    inferSupabaseUrlFromDatabase();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    adminClient = null;
    return null;
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

function inferSupabaseUrlFromDatabase(): string | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const host = new URL(databaseUrl).hostname;
    const match = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (!match) return null;
    return `https://${match[1]}.supabase.co`;
  } catch {
    return null;
  }
}

export async function uploadFile(
  file: File,
  objectPath: string,
  localSubdir: string
): Promise<{ url: string; storage: "supabase" | "local" }> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return { url: data.publicUrl, storage: "supabase" };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Configura SUPABASE_SERVICE_ROLE_KEY en Vercel para subir archivos"
    );
  }

  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");

  const uploadDir = path.join(process.cwd(), "public", "uploads", localSubdir);
  await mkdir(uploadDir, { recursive: true });

  const filename = objectPath.split("/").pop()!;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return { url: `/uploads/${localSubdir}/${filename}`, storage: "local" };
}

export async function uploadProductImage(
  file: File,
  filename: string
): Promise<{ url: string; storage: "supabase" | "local" }> {
  return uploadFile(file, `products/${filename}`, "products");
}

export async function uploadPaymentProof(
  file: File,
  filename: string
): Promise<{ url: string; storage: "supabase" | "local" }> {
  return uploadFile(file, `payment-proofs/${filename}`, "payment-proofs");
}
