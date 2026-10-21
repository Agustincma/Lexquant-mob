import { apiBaseUrl } from "@/api/config";
import { readToken } from "@/auth/session";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await readToken();
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("No se pudo conectar con la API de Lexquant", 0);
  }

  if (res.status === 401 && token && !path.startsWith("/api/auth/")) {
    onUnauthorized?.();
    throw new ApiError("La sesión expiró", 401);
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new ApiError(body?.error ?? `Error al llamar ${path}`, res.status);
  }
  return body as T;
}

export function sessionTokenFrom(body: { token?: string }, response: Response): string | null {
  if (typeof body.token === "string" && body.token) return body.token;
  const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  const raw = [response.headers.get("set-cookie") ?? "", ...setCookies].filter(Boolean).join("; ");
  const match = /lexquant_session=([^;]+)/.exec(raw);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
