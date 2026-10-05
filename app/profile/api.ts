import { getStudyState } from "@/lib/studynao-api";
import { api } from "@/lib/api";
import type { Role } from "@/lib/types";

export function getProfile(role: Role) {
  return getStudyState(role);
}

export type LoginDevice = { session_id: string; device: string; created_at: string | null; last_active_at: string | null; is_current: boolean };

export function uploadAvatar(blob: Blob) {
  const body = new FormData();
  body.append("file", blob, "avatar.jpg");
  return api<{ avatar_url: string }>("/api/user/profile/avatar", { method: "POST", body });
}

export function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  return api<{ message: string }>("/api/user/change-password", { method: "POST", body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }) });
}

export async function fetchLoginDevices() {
  const result = await api<{ sessions: LoginDevice[] }>("/api/auth/sessions");
  return result.sessions;
}

export function forgetLoginDevice(sessionId: string) {
  return api<{ message: string; was_current: boolean }>(`/api/auth/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" });
}
