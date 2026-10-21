import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { getMyFlags } from "@/api/dashboard";
import { useAuth } from "@/auth/auth-context";
import { firstEnabledHref, type FeatureFlags } from "@/types/api";

type FlagsStatus = "idle" | "loading" | "ready" | "error";

type FlagsContextValue = {
  status: FlagsStatus;
  flags: FeatureFlags;
  homeHref: string;
  refetch: () => void;
};

const FlagsContext = createContext<FlagsContextValue | null>(null);

export function FlagsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const query = useQuery({
    queryKey: ["feature-flags", user?.id],
    queryFn: getMyFlags,
    enabled: authStatus === "authenticated",
  });

  const flags = query.data?.flags ?? {};
  const status: FlagsStatus =
    authStatus !== "authenticated" ? "idle" : query.isError ? "error" : query.isSuccess ? "ready" : "loading";

  return (
    <FlagsContext.Provider
      value={{
        status,
        flags,
        homeHref: firstEnabledHref(flags),
        refetch: () => {
          void query.refetch();
        },
      }}
    >
      {children}
    </FlagsContext.Provider>
  );
}

export function useFlags() {
  const value = useContext(FlagsContext);
  if (!value) throw new Error("useFlags tiene que usarse dentro de FlagsProvider");
  return value;
}
