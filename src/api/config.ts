import Constants from "expo-constants";
import { Platform } from "react-native";

/** Misma API (y por lo tanto la misma base) que la web. Puerto por defecto: 8001. */
export function apiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:8001`;
  if (Platform.OS === "android") return "http://10.0.2.2:8001";
  return "http://localhost:8001";
}
