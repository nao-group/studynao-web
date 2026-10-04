import { api } from "@/lib/api";
import type { ResetPasswordInput } from "./types";

export function resetPassword(data: ResetPasswordInput) {
  return api("/api/auth/reset-password", { method: "POST", body: JSON.stringify(data) }, false);
}
