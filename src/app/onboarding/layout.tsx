import { redirect } from "next/navigation";
import { getRegistroUrl } from "@/shared/lib/registro-url";

export default function OnboardingRootLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect(getRegistroUrl());
}
