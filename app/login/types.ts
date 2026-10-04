import type { Role } from "@/lib/types";

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: { user_id: string; full_name: string; email: string };
};

export type Device = { session_id: string; device: string; created_at: string };
export type PendingLogin = { login_token: string; sessions: Device[] };
export type LoginCredentials = { email: string; password: string };
export type LoginFormProps = {
  role: Role;
  email: string;
  password: string;
  busy: boolean;
  onRoleChange: (role: Role) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onForgotPassword: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export type DeviceLimitModalProps = {
  pending: PendingLogin | null;
  selected: string;
  busy: boolean;
  onSelectedChange: (value: string) => void;
  onClose: () => void;
  onRevoke: () => void;
};

export type ForgotPasswordModalProps = {
  opened: boolean;
  email: string;
  sentTo: string | null;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onTryAgain: () => void;
};
