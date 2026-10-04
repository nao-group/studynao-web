import { api } from "@/lib/api";
import { getProgramCatalog, getStudyState } from "@/lib/studynao-api";
import type { Role, StudyState } from "@/lib/types";
import type { ProvinceOption, StudentOnboarding, TeacherOnboarding } from "./types";

export async function getProvinces(): Promise<ProvinceOption[]> {
  const response = await api<{ data: { code: string; name: string }[] }>("/api/onboarding/provinces", {}, false);
  return response.data.map(({ name }) => ({ value: name, label: name }));
}

export async function getOnboardingData(role: Role) {
  const [profile, catalog] = await Promise.all([getStudyState(role), getProgramCatalog()]);
  return { profile, catalog };
}

export function saveOnboarding(role: Role, data: StudentOnboarding | TeacherOnboarding) {
  return api<StudyState>(`/api/studynao/${role}/onboarding`, { method: "PUT", body: JSON.stringify(data) });
}

export function uploadTeacherPhoto(photo: File) {
  const form = new FormData();
  form.set("file", photo);
  return api<StudyState>("/api/studynao/teacher/onboarding/photo", { method: "POST", body: form });
}
