import type { ClassRequest, ClassSession, Program, Role, ScheduledClass, StudyState } from "@/lib/types";
import type { ClassDetailSource } from "@/lib/class-navigation";

export type ClassDetailProps = {
  id: number;
  kind: "class" | "request";
  role: Role;
  sessionId: number | null;
  from: ClassDetailSource;
};

export type ClassDetailSnapshot = {
  profile: StudyState;
  scheduledClass: ScheduledClass | null;
  request: ClassRequest | null;
  program: Program | undefined;
  subjectName: string;
  sessions: ClassSession[];
  loadedAt: number;
};

export type TeacherChecklist = {
  zoom_link_sent: boolean;
  camera_reminder_sent: boolean;
  recording_started: boolean;
  slides_sent: boolean;
  homework_sent: boolean;
  recording_uploaded: boolean;
  attendance_report_completed: boolean;
};
export type AttendanceStatus = "present" | "late" | "absent" | "excused";
export type TeacherSessionDetail = {
  session: ClassSession;
  class: { id: number; code: string; status: string };
  operations: (TeacherChecklist & { teaching_log: string | null; late_reason: string | null; submitted_at: string | null }) | null;
  attendance: { student_user_id: string; student_name: string; status: AttendanceStatus | null; note: string | null }[];
};

export type DetailSearchParams = { role?: string; session?: string; from?: string };
