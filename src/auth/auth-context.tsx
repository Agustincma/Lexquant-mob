import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginRequest, logoutRequest, meRequest, registerRequest } from "@/api/auth";
import { queryClient } from "@/api/query-client";
import { setUnauthorizedHandler } from "@/api/client";
import { clearSession, readToken, saveSession } from "@/auth/session";
import type { Usuario } from "@/types/api";

type Status = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: Status;
  user: Usuario | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<Usuario | null>(null);

  const logout = useCallback(async () => {
    await logoutRequest();
    await clearSession();
    queryClient.clear();
    setUser(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let active = true;
    readToken()
      .then(async (token) => {
        if (!token) return null;
        const { user: current } = await meRequest();
        return current;
      })
      .then((current) => {
        if (!active) return;
        setUser(current);
        setStatus(current ? "authenticated" : "anonymous");
      })
      .catch(async () => {
        await clearSession();
        if (!active) return;
        setUser(null);
        setStatus("anonymous");
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const { user: next, token } = await loginRequest({ email: email.trim(), password, remember });
    await saveSession(token, next, remember);
    queryClient.clear();
    setUser(next);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (email: string, password: string, nombre: string) => {
    const trimmedName = nombre.trim();
    const { user: next, token } = await registerRequest({
      email: email.trim(),
      password,
      ...(trimmedName ? { nombre: trimmedName } : {}),
    });
    await saveSession(token, next, true);
    queryClient.clear();
    setUser(next);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth tiene que usarse dentro de AuthProvider");
  return value;
}
