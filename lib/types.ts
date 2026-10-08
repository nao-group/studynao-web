export type Role = "student" | "teacher";

export type StudyState = {
  user: { user_id: string; full_name: string; email: string; avatar_url?: string | null };
  membership: { role: Role; status: string } | null;
  profile: Record<string, unknown> | null;
};

export type Program = {
  id: number;
  code: string;
  subject: string;
  program: string;
  class_type: "private" | "group";
  teaching_language: "English" | "Chinese";
  session_count: number;
  duration_minutes: number;
  active: boolean;
  subject_ids: number[];
};

export type Subject = { id: number; name: string };
export type ProgramCatalog = { items: Program[]; subjects: Subject[] };
export type WeeklyBlock = { weekday: number; start_minute: number; end_minute: number };
export type ClassRequest = { id: number; program_id: number; offering_id: number; preferred_start_date: string; status: string; created_at: string };
export type ScheduledClass = { id: number; code: string; program_id: number; offering_id: number; class_type: "private" | "group"; teaching_language: string; teacher_name?: string; student_names?: string[]; subject_name?: string; capacity: number; first_date: string; final_date: string | null; status: string };
export type ClassSession = { id: number; class_id: number; session_number: number; starts_at: string; ends_at: string; status: string; teaching_log_submitted_at?: string | null };
export type SchedulingState = { requests: ClassRequest[]; availability: WeeklyBlock[]; availability_submitted: boolean; needs_private_availability: boolean; classes: ScheduledClass[]; sessions: ClassSession[] };
export type GroupOption = ScheduledClass & { teacher_name: string; seats_available: number; schedule_conflict: boolean; slots: WeeklyBlock[] };
