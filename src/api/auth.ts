import { apiBaseUrl } from "@/api/config";
import { api, sessionTokenFrom } from "@/api/client";
import type { Usuario } from "@/types/api";

async function authPost(path: string, data: unknown): Promise<{ user: Usuario; token: string }> {
  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("No se pudo conectar con la API de Lexquant");
  }
  const body = (await res.json().catch(() => null)) as { error?: string; user?: Usuario; token?: string } | null;
  if (!res.ok || !body?.user) {
    throw new Error(body?.error || "No se pudo completar la solicitud");
  }
  const token = sessionTokenFrom(body, res);
  if (!token) {
    throw new Error("La API no devolvió la sesión. Reiniciá Lexquant API para habilitar el acceso mobile.");
  }
  return { user: body.user, token };
}

export function loginRequest(data: { email: string; password: string; remember?: boolean }) {
  return authPost("/api/auth/login", data);
}

export function registerRequest(data: { email: string; password: string; nombre?: string }) {
  return authPost("/api/auth/register", data);
}

export function logoutRequest() {
  return api<void>("/api/auth/logout", { method: "POST" }).catch(() => undefined);
}

export function meRequest() {
  return api<{ user: Usuario }>("/api/auth/me");
}
