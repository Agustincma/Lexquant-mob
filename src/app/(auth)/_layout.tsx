import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/auth/auth-context";
import { BootScreen } from "@/components/ui/boot-screen";

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === "loading") return <BootScreen />;
  if (status === "authenticated") return <Redirect href="/" />;
  return <Slot />;
}
