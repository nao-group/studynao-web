import type { SchedulingState, StudyState } from "@/lib/types";

export function needsPrivateAvailability(profile: StudyState, scheduling: SchedulingState): boolean {
  return Boolean(profile.membership && scheduling.needs_private_availability && !scheduling.availability_submitted);
}
