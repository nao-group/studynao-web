import type { SchedulingState, StudyState } from "@/lib/types";

export function needsPrivateAvailability(profile: StudyState, scheduling: SchedulingState): boolean {
  if (profile.membership?.role === "teacher" && profile.membership.status === "availability_required") return true;
  return Boolean(profile.membership && scheduling.needs_private_availability && !scheduling.availability_submitted);
}
