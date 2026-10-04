import { api } from "@/lib/api";
import type { LoginCredentials, LoginResponse, PendingLogin } from "./types";

export function logIn(credentials: LoginCredentials) {
  return api<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }, false);
}

export function revokeDevice(data: Pick<PendingLogin, "login_token"> & { session_id: string }) {
  return api<LoginResponse>("/api/auth/sessions/revoke", { method: "POST", body: JSON.stringify(data) }, false);
}

export function sendPasswordReset(email: string) {
  return api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email, product: "studynao" }) }, false);
}
