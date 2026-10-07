import { api } from "@/lib/api";
import { getClassesData } from "../api";
import type { Role } from "@/lib/types";
import type { AttendanceStatus, TeacherChecklist, TeacherSessionDetail } from "./types";

export const getClassDetailData = (role: Role) => getClassesData(role);
export const getTeacherSession = (id: number) => api<TeacherSessionDetail>(`/api/studynao/teacher/sessions/${id}`);
export const updateTeacherChecklist = (id: number, changes: Partial<TeacherChecklist>) =>
  api<TeacherSessionDetail>(`/api/studynao/teacher/sessions/${id}/checklist`, { method: "PATCH", body: JSON.stringify(changes) });
export const submitTeachingLog = (id: number, teaching_log: string, late_reason: string | null) =>
  api<TeacherSessionDetail>(`/api/studynao/teacher/sessions/${id}/teaching-log`, { method: "POST", body: JSON.stringify({ teaching_log, late_reason }) });
export const updateStudentAttendance = (id: number, studentId: string, status: AttendanceStatus) =>
  api<TeacherSessionDetail>(`/api/studynao/teacher/sessions/${id}/attendance/${encodeURIComponent(studentId)}`, {
    method: "PUT", body: JSON.stringify({ status }),
  });
