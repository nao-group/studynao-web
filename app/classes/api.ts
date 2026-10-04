import { api } from "@/lib/api";
import { getProgramCatalog, getSchedulingState, getStudyState } from "@/lib/studynao-api";
import type { Role } from "@/lib/types";
import type { ClassRequestInput, CreatedClassRequests, GroupOptions } from "./types";

export async function getClassesData(role: Role) {
  const profile = await getStudyState(role);
  if (!profile.membership || profile.membership.status === "onboarding" || profile.membership.status === "rejected") {
    return { profile, schedule: null, catalog: null };
  }
  const [schedule, catalog] = await Promise.all([getSchedulingState(role), getProgramCatalog()]);
  return { profile, schedule, catalog };
}

export function createClassRequests(data: ClassRequestInput) {
  return api<CreatedClassRequests>("/api/studynao/student/class-requests", { method: "POST", body: JSON.stringify(data) });
}

export function getGroupOptions(requestId: number) {
  return api<GroupOptions>(`/api/studynao/student/class-requests/${requestId}/group-options`);
}

export function enrollInGroup(requestId: number, classId: number) {
  return api(`/api/studynao/student/class-requests/${requestId}/enroll/${classId}`, { method: "POST" });
}
