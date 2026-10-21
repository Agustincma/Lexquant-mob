import type { Usuario } from "@/types/api";
import { deleteItem, getItem, setItem } from "@/auth/storage";

const TOKEN_KEY = "lexquant_token";
const USER_KEY = "lexquant_user";

let memoryToken: string | null = null;

export async function readToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  return getItem(TOKEN_KEY);
}

export async function saveSession(token: string, user: Usuario, remember: boolean) {
  memoryToken = token;
  if (remember) {
    await setItem(TOKEN_KEY, token);
    await setItem(USER_KEY, JSON.stringify(user));
    return;
  }
  await deleteItem(TOKEN_KEY);
  await deleteItem(USER_KEY);
}

export async function clearSession() {
  memoryToken = null;
  await deleteItem(TOKEN_KEY);
  await deleteItem(USER_KEY);
}
