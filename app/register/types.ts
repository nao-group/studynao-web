import type { Role } from "@/lib/types";

export type RegistrationDetails = {
  full_name: string;
  email: string;
  password: string;
  otp: string;
  studynao_role: Role;
};

export type RegisterFormProps = {
  role: Role;
  fullName: string;
  email: string;
  password: string;
  otp: string;
  sent: boolean;
  countdown: number;
  sendingOtp: boolean;
  submitting: boolean;
  canSendOtp: boolean;
  onRoleChange: (value: Role) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onOtpChange: (value: string) => void;
  onSendOtp: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
