/** Safe fetch helpers for admin client pages. */

type FetchResult<T> = {
  ok: boolean;
  data: T;
  error?: string;
};

export async function fetchJsonArray<T>(
  url: string
): Promise<FetchResult<T[]>> {
  try {
    const res = await fetch(url);
    const body: unknown = await res.json();

    if (!res.ok) {
      const error =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: unknown }).error)
          : "Error de servidor";
      return { ok: false, data: [], error };
    }

    if (!Array.isArray(body)) {
      return { ok: false, data: [], error: "Respuesta inválida del servidor" };
    }

    return { ok: true, data: body as T[] };
  } catch {
    return { ok: false, data: [], error: "Error de conexión" };
  }
}

export async function fetchJson<T extends Record<string, unknown>>(
  url: string
): Promise<FetchResult<T | null>> {
  try {
    const res = await fetch(url);
    const body: unknown = await res.json();

    if (!res.ok) {
      const error =
        body && typeof body === "object" && "error" in body
          ? String((body as { error: unknown }).error)
          : "Error de servidor";
      return { ok: false, data: null, error };
    }

    if (!body || typeof body !== "object") {
      return { ok: false, data: null, error: "Respuesta inválida del servidor" };
    }

    return { ok: true, data: body as T };
  } catch {
    return { ok: false, data: null, error: "Error de conexión" };
  }
}
