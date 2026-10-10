"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { ApiError } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { useAuth } from "@/store/auth";
import { needsPrivateAvailability } from "@/lib/scheduling";
import { getSchedulingState, getStudyState, joinStudyNao } from "@/lib/studynao-api";
import { logIn, revokeDevice, sendPasswordReset } from "../api";
import type { LoginResponse, PendingLogin } from "../types";
import { LoginForm } from "./LoginForm";
import { DeviceLimitModal } from "./DeviceLimitModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingLogin | null>(null);
  const [selected, setSelected] = useState(""); const [forgot, setForgot] = useState(false); const [sentTo, setSentTo] = useState<string | null>(null);
  async function finish(data: LoginResponse) {
    useAuth.getState().setSession(data.access_token, data.refresh_token, data.user);
    let state = await getStudyState(role);
    if (!state.membership) state = await joinStudyNao(role);
    notifySuccess("Welcome back!", `Good to see you again, ${data.user.full_name.split(" ")[0]}.`);
    if (state.membership?.status === "availability_required") { router.replace("/availability?role=teacher"); return; }
    if (state.membership?.status === "onboarding") { router.replace(`/onboarding?role=${role}`); return; }
    if (state.membership?.status === "active" || state.membership?.status === "pending_verification") {
      const scheduling = await getSchedulingState(role);
      if (needsPrivateAvailability(state, scheduling)) { router.replace(`/availability?role=${role}`); return; }
      if (role === "student" && !scheduling.requests.length && !scheduling.classes.length) { router.replace("/classes?role=student"); return; }
    }
    router.replace(`/dashboard?role=${role}`);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try { await finish(await logIn({ email, password })); }
    catch (cause) {
      // The shared auth endpoint returns 409 when two devices are already signed in.
      if (cause instanceof ApiError && cause.status === 409 && typeof cause.data.login_token === "string") {
        const data = cause.data as PendingLogin; setPending(data); setSelected(data.sessions?.[0]?.session_id ?? "");
      } else notifyError(cause instanceof Error ? cause.message : "Unable to log in.", "Login failed");
    } finally { setBusy(false); }
  }
  async function revoke() {
    if (!pending || !selected) return; setBusy(true);
    try { await finish(await revokeDevice({ login_token: pending.login_token, session_id: selected })); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to log in.", "Login failed"); }
    finally { setBusy(false); }
  }
  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to send the reset link.", "Reset link failed"); }
    finally { setBusy(false); }
  }
  return <>
    <AuthFrame mode="login" title="Log in to StudyNao" description="Use the same NAO account you use for ThinkNao.">
      <LoginForm role={role} email={email} password={password} busy={busy} onRoleChange={setRole} onEmailChange={setEmail} onPasswordChange={setPassword} onForgotPassword={() => setForgot(true)} onSubmit={submit} />
    </AuthFrame>
    <DeviceLimitModal pending={pending} selected={selected} busy={busy} onSelectedChange={setSelected} onClose={() => setPending(null)} onRevoke={() => void revoke()} />
    <ForgotPasswordModal opened={forgot} email={email} sentTo={sentTo} busy={busy} onEmailChange={setEmail} onClose={() => { setForgot(false); setSentTo(null); }} onSubmit={sendReset} onTryAgain={() => setSentTo(null)} />
  </>;
}
