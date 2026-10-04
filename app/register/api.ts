import { api } from "@/lib/api";
import type { RegistrationDetails } from "./types";

export function sendRegistrationOtp(fullName: string, email: string) {
  return api("/api/auth/otp/send", { method: "POST", body: JSON.stringify({ full_name: fullName, email }) }, false);
}

export function registerAccount(details: RegistrationDetails) {
  return api("/api/auth/register", { method: "POST", body: JSON.stringify(details) }, false);
}
