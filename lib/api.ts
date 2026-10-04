import { useAuth } from "@/store/auth";

const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export class ApiError extends Error {
  constructor(message: string, public status: number, public data: Record<string, unknown>) { super(message); }
}
export async function api<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  let token = useAuth.getState().accessToken;
  async function refresh(): Promise<string | null> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("studynao-refresh-token") : null;
    if (refreshToken) {
      const response = await fetch(`${base}/api/auth/token/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }) });
      if (response.ok) { const nextToken = (await response.json()).access_token as string; useAuth.getState().setToken(nextToken); return nextToken; }
    }
    useAuth.getState().clear();
    return null;
  }
  if (authenticated && !token) token = await refresh();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);
  let response = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
  if (authenticated && response.status === 401 && token) {
    token = await refresh();
    if (token) { headers.set("Authorization", `Bearer ${token}`); response = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" }); }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.detail ?? data.message ?? "Unable to process your request.", response.status, data);
  return data as T;
}
