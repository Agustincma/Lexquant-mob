import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { getItem, setItem } from "@/auth/storage";
import { dark, light, type ColorScheme, type Palette } from "@/theme/palette";

const STORAGE_KEY = "lexquant_theme";

type ThemeContextValue = {
  scheme: ColorScheme;
  colors: Palette;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [scheme, setSchemeState] = useState<ColorScheme>(system === "dark" ? "dark" : "light");

  useEffect(() => {
    getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") setSchemeState(stored);
    });
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    void setItem(STORAGE_KEY, next);
  }, []);

  const toggleScheme = useCallback(() => {
    setScheme(scheme === "dark" ? "light" : "dark");
  }, [scheme, setScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ scheme, colors: scheme === "dark" ? dark : light, setScheme, toggleScheme }),
    [scheme, setScheme, toggleScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme tiene que usarse dentro de ThemeProvider");
  return value;
}
