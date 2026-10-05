"use client";

import { useState } from "react";
import { Group, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { changePassword } from "../api";

export function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (next.length < 8) return notifyError("Your new password must be at least 8 characters.");
    if (next !== confirm) return notifyError("New password and confirmation do not match.");
    setSaving(true);
    try {
      await changePassword(current, next, confirm);
      setCurrent(""); setNext(""); setConfirm("");
      notifySuccess("Password updated", "Use your new password the next time you sign in.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "Unable to update password."); }
    finally { setSaving(false); }
  }
  return <StudyCard p={{ base: "lg", sm: "xl" }}><form onSubmit={(event) => void submit(event)}><Stack gap="md">
    <Group gap="sm"><IconLock size={22} color="#d4a017" /><div><Title order={2} size="h3">Change password</Title><Text size="sm" c="dimmed">Keep your account secure with a new password.</Text></div></Group>
    <PasswordInput label="Current password" value={current} onChange={(event) => setCurrent(event.currentTarget.value)} required autoComplete="current-password" />
    <PasswordInput label="New password" value={next} onChange={(event) => setNext(event.currentTarget.value)} required autoComplete="new-password" description="At least 8 characters" />
    <PasswordInput label="Confirm new password" value={confirm} onChange={(event) => setConfirm(event.currentTarget.value)} required autoComplete="new-password" />
    <Group justify="flex-end"><LandingActionButton type="submit" loading={saving}>Update password</LandingActionButton></Group>
  </Stack></form></StudyCard>;
}
