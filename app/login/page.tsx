"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Modal, PasswordInput, Radio, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconAt, IconLock } from "@tabler/icons-react";
import { AuthFrame } from "@/components/auth-frame";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { api, ApiError, type StudyState } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { useAuth } from "@/store/auth";

type LoginResponse = { access_token: string; refresh_token: string; user: { user_id: string; full_name: string; email: string } };
type Device = { session_id: string; device: string; created_at: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ login_token: string; sessions: Device[] } | null>(null);
  const [selected, setSelected] = useState(""); const [forgot, setForgot] = useState(false);
  async function finish(data: LoginResponse) {
    useAuth.getState().setSession(data.access_token, data.refresh_token, data.user);
    let state = await api<StudyState>(`/api/studynao/me?role=${role}`);
    if (!state.membership) state = await api<StudyState>("/api/studynao/join", { method: "POST", body: JSON.stringify({ role }) });
    notifySuccess("Welcome back!", `Good to see you again, ${data.user.full_name.split(" ")[0]}.`);
    router.replace(`${state.membership?.status === "onboarding" ? "/onboarding" : "/dashboard"}?role=${role}`);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try { await finish(await api<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false)); }
    catch (cause) {
      // The shared auth endpoint returns 409 when two devices are already signed in.
      if (cause instanceof ApiError && cause.status === 409 && typeof cause.data.login_token === "string") {
        const data = cause.data as { login_token: string; sessions: Device[] }; setPending(data); setSelected(data.sessions?.[0]?.session_id ?? "");
      } else notifyError(cause instanceof Error ? cause.message : "Unable to log in.", "Login failed");
    } finally { setBusy(false); }
  }
  async function revoke() {
    if (!pending || !selected) return; setBusy(true);
    try { await finish(await api<LoginResponse>("/api/auth/sessions/revoke", { method: "POST", body: JSON.stringify({ login_token: pending.login_token, session_id: selected }) }, false)); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to log in.", "Login failed"); }
    finally { setBusy(false); }
  }
  async function sendReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email, product: "studynao" }) }, false);
      setForgot(false);
      notifySuccess("Reset link sent", "Check your email for a password reset link.");
    }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to send the reset link.", "Reset link failed"); }
    finally { setBusy(false); }
  }
  return <AuthFrame mode="login" title="Log in to StudyNao" description="Use the same NAO account you use for ThinkNao."><form onSubmit={submit}><Stack><Text size="sm" fw={600}>Log in as</Text><SegmentedControl fullWidth value={role} onChange={(value) => setRole(value as "student" | "teacher")} data={[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }]} /><TextInput label="Email" placeholder="you@example.com" leftSection={<IconAt size={16} stroke={1.5} />} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.currentTarget.value)} /><PasswordInput label="Password" placeholder="••••••••" leftSection={<IconLock size={16} stroke={1.5} />} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.currentTarget.value)} /><Anchor size="sm" onClick={() => setForgot(true)}>Forgot password?</Anchor><LandingActionButton presentation="auth" type="submit" fullWidth size="md" loading={busy} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Log in</LandingActionButton><Text size="sm" ta="center">New to Nao Academy? <Anchor component={Link} href="/register">Sign up</Anchor></Text></Stack></form><Modal opened={Boolean(pending)} onClose={() => setPending(null)} title="Device limit reached"><Stack><Text size="sm">Choose a device to sign out so you can log in on this one.</Text><Radio.Group value={selected} onChange={setSelected}><Stack>{pending?.sessions.map((item) => <Radio key={item.session_id} value={item.session_id} label={item.device} />)}</Stack></Radio.Group><LandingActionButton loading={busy} onClick={() => void revoke()} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Sign out device and log in</LandingActionButton></Stack></Modal><Modal opened={forgot} onClose={() => setForgot(false)} centered radius="xl" padding="xl" size="md" title="Reset your password" styles={{ title: { fontSize: "1.5rem", fontWeight: 700 }, header: { alignItems: "flex-start" } }}><form onSubmit={sendReset}><Stack gap="lg"><Text c="dimmed">Enter the email address for your account and we'll send you a reset link.</Text><TextInput label="Email address" placeholder="you@example.com" leftSection={<IconAt size={16} stroke={1.5} />} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.currentTarget.value)} /><LandingActionButton presentation="auth" type="submit" fullWidth loading={busy} disabled={!email.trim()} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Send reset link</LandingActionButton></Stack></form></Modal></AuthFrame>;
}
