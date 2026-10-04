import type { Role, SchedulingState, StudyState } from "@/lib/types";

export type DashboardSnapshot = { role: Role; profile: StudyState; schedule: SchedulingState; loadedAt: number };
