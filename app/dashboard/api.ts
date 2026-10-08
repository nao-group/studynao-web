import { getSchedulingState, getStudyState } from "@/lib/studynao-api";
import type { Role, SchedulingState } from "@/lib/types";

const emptySchedule: SchedulingState = {
  requests: [], availability: [], availability_submitted: false,
  needs_private_availability: false, classes: [], sessions: [],
};

export async function getDashboardData(role: Role) {
  const profile = await getStudyState(role);
  const status = profile.membership?.status;
  const schedule = status === "active" || status === "pending_verification" || (role === "student" && status === "inactive")
    ? await getSchedulingState(role) : emptySchedule;
  return { profile, schedule };
}
