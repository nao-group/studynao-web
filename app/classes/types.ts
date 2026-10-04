import type { ClassRequest, GroupOption, Program, Role, ScheduledClass, Subject } from "@/lib/types";

export type ClassRequestInput = { program_id: number; subject_ids: number[]; preferred_start_date: string };
export type CreatedClassRequests = { items: ClassRequest[] };
export type GroupOptions = { items: GroupOption[] };

export type ClassRequestFormProps = {
  programs: Program[];
  subjects: Subject[];
  selectedProgram: Program | undefined;
  programId: string | null;
  subjectIds: string[];
  firstDate: string;
  busy: boolean;
  onProgramChange: (value: string | null) => void;
  onSubjectsChange: (value: string[]) => void;
  onFirstDateChange: (value: string) => void;
  onSubmit: () => void;
};

export type GroupRequestCardProps = {
  request: ClassRequest;
  subject: Subject | undefined;
  options: GroupOption[] | undefined;
  busy: boolean;
  onRefresh: () => void;
  onEnroll: (classId: number) => void;
};

export type AssignedClassesProps = { role: Role; classes: ScheduledClass[]; subjects: Subject[] };
