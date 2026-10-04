import type { Subject } from "@/lib/types";

export type ProvinceOption = { value: string; label: string };
export type StudentOnboarding = { whatsapp: string; study_level: string; parent_email: string | null };
export type TeacherOnboarding = {
  whatsapp: string;
  birth_date: string;
  province: string;
  marital_status: string;
  class_types: string[];
  teaching_languages: string[];
  subject_ids: number[];
  hsk_level: number | null;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
};
export type StudentFieldsProps = {
  studyLevel: string;
  onStudyLevelChange: (value: string) => void;
  parentEmail: string;
  onParentEmailChange: (value: string) => void;
};

export type TeacherFieldsProps = {
  photoPreview: string;
  photoFile: File | null;
  hasSavedPhoto: boolean;
  onPhotoChange: (value: File | null) => void;
  birthDate: string;
  onBirthDateChange: (value: string) => void;
  provinceOptions: ProvinceOption[];
  selectedProvince: string;
  onProvinceChange: (value: string) => void;
  provincesLoading: boolean;
  provincesFailed: boolean;
  onRetryProvinces: () => void;
  maritalStatus: string;
  onMaritalStatusChange: (value: string) => void;
  classTypes: string[];
  onClassTypesChange: (value: string[]) => void;
  languages: string[];
  onLanguagesChange: (value: string[]) => void;
  hskLevel: string;
  onHskLevelChange: (value: string) => void;
  availableSubjects: Subject[];
  subjectIds: string[];
  onSubjectIdsChange: (value: string[]) => void;
  bankName: string;
  otherBank: boolean;
  onBankChoiceChange: (value: string | null) => void;
  onBankNameChange: (value: string) => void;
  bankNumber: string;
  onBankNumberChange: (value: string) => void;
  bankOwner: string;
  onBankOwnerChange: (value: string) => void;
};
