import { api } from "@/api/client";
import type { AdminFlag, AdminUserMatch, AdminUserPages, FlagKey } from "@/types/api";

export function searchAdminUsers(q: string) {
  return api<{ users: AdminUserMatch[] }>(`/api/admin/users?q=${encodeURIComponent(q)}`);
}

export function getAdminUserPages(email: string) {
  return api<AdminUserPages>(`/api/admin/users/${encodeURIComponent(email)}/pages`);
}

export function setUserPages(email: string, pages: FlagKey[]) {
  return api<AdminUserPages>(`/api/admin/users/${encodeURIComponent(email)}/pages`, {
    method: "PUT",
    body: JSON.stringify({ pages }),
  });
}

export function listAdminFlags() {
  return api<{ flags: AdminFlag[] }>("/api/admin/feature-flags");
}

export function setFlagEnabled(key: FlagKey, enabled: boolean) {
  return api<{ flag: AdminFlag }>(`/api/admin/feature-flags/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}
