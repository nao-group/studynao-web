"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconArrowRight, IconLock } from "@tabler/icons-react";
import { PasswordInput, Stack, Text } from "@mantine/core";
import { AuthFrame } from "@/components/auth-frame";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { api } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/feedback";

function ResetForm() {
  const token = useSearchParams().get("token"); const router = useRouter();
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const missingTokenNotified = useRef(false);
  useEffect(() => {
    if (!token && !missingTokenNotified.current) {
      missingTokenNotified.current = true;
      notifyError("The reset link is incomplete. Request a new one from the login page.", "Invalid reset link");
    }
  }, [token]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { notifyError("Passwords do not match.", "Check your password"); return; }
    setBusy(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password: password }) }, false);
      notifySuccess("Password updated", "You can now log in with your new password.");
      router.replace("/login");
    }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "This link is invalid or has expired.", "Password reset failed"); }
    finally { setBusy(false); }
  }
  return <AuthFrame mode="reset" title="Set a new password" description="Your new password will apply to your NAO account.">{!token ? <Text size="sm" c="dimmed">Request a new reset link from the login page.</Text> : <form onSubmit={submit}><Stack><PasswordInput label="New password" placeholder="At least 8 characters" leftSection={<IconLock size={16} stroke={1.5} />} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.currentTarget.value)} /><PasswordInput label="Confirm password" placeholder="Repeat your new password" leftSection={<IconLock size={16} stroke={1.5} />} autoComplete="new-password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.currentTarget.value)} /><LandingActionButton presentation="auth" type="submit" fullWidth loading={busy} rightSection={!busy && <IconArrowRight size={16} stroke={2.2} />}>Save password</LandingActionButton><Text size="sm" c="dimmed">Use at least 8 characters.</Text></Stack></form>}</AuthFrame>;
}
export default function ResetPasswordPage() { return <Suspense><ResetForm /></Suspense>; }
