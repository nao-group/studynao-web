import type { Role } from "./types";

export type ClassDetailSource = "classes" | "dashboard";

export function classDetailHref(classId: number, role: Role, sessionId?: number, from: ClassDetailSource = "classes") {
  const query = new URLSearchParams({ role });
  if (sessionId) query.set("session", String(sessionId));
  if (from === "dashboard") query.set("from", from);
  return `/classes/${classId}?${query}`;
}

export function classRequestHref(requestId: number, role: Role) {
  return `/classes/requests/${requestId}?role=${role}`;
}
