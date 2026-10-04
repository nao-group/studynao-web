import { getStudyState } from "@/lib/studynao-api";
import type { Role } from "@/lib/types";

export function getProfile(role: Role) {
  return getStudyState(role);
}
