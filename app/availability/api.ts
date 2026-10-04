import { api } from "@/lib/api";
import { getSchedulingState, getStudyState } from "@/lib/studynao-api";
import type { Role, SchedulingState } from "@/lib/types";
import type { AvailabilitySubmission } from "./types";

export async function getAvailabilityData(role: Role) {
  const profile = await getStudyState(role);
  if (!profile.membership || profile.membership.status === "onboarding" || profile.membership.status === "rejected") {
    return { profile, schedule: null };
  }
  return { profile, schedule: await getSchedulingState(role) };
}

export function submitAvailability(data: AvailabilitySubmission) {
  return api<SchedulingState>("/api/studynao/availability", { method: "PUT", body: JSON.stringify(data) });
}
