import { api } from "@/lib/api";
import type { ProgramCatalog, Role, SchedulingState, StudyState } from "@/lib/types";

export function getStudyState(role: Role) {
  return api<StudyState>(`/api/studynao/me?role=${role}`);
}

export function getProgramCatalog() {
  return api<ProgramCatalog>("/api/studynao/programs", {}, false);
}

export function getSchedulingState(role: Role) {
  return api<SchedulingState>(`/api/studynao/scheduling/state?role=${role}`);
}

export function joinStudyNao(role: Role) {
  return api<StudyState>("/api/studynao/join", { method: "POST", body: JSON.stringify({ role }) });
}

export function logOut() {
  return api("/api/auth/logout", { method: "POST" });
}
