import { redirect } from "next/navigation";
import { getRegistroUrl } from "@/shared/lib/registro-url";

export default function RegistroPage() {
  redirect(getRegistroUrl());
}
