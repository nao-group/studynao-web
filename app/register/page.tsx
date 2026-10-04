"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, Box, Group, PasswordInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { IconArrowRight, IconAt, IconLock, IconSend, IconShield, IconUser } from "@tabler/icons-react";
import { AuthFrame } from "@/components/auth-frame";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { api } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/feedback";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function sendOtp() {
    setSendingOtp(true);
    try {
      await api("/api/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      }, false);
      setSent(true);
      setCountdown(60);
      notifySuccess("Verification code sent", "Check your email for the 6-digit code.");
    } catch (cause) {
      notifyError(cause instanceof Error ? cause.message : "Unable to send the verification code.", "Could not send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), password, otp, studynao_role: role }),
      }, false);
      notifySuccess("Account created!", "You’re all set. Please log in to continue.");
      router.replace("/login");
    } catch (cause) {
      notifyError(cause instanceof Error ? cause.message : "Registration failed.", "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canSendOtp = fullName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <AuthFrame mode="register" title="Create your StudyNao account" description="Choose your role. Teachers need admin approval before they can teach.">
      <form onSubmit={submit}>
        <Stack gap="lg">
          <Text size="sm" fw={600}>Sign up as</Text>
          <SegmentedControl
            fullWidth
            value={role}
            onChange={(value) => setRole(value as "student" | "teacher")}
            data={[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }]}
          />
          <TextInput
            label="Full name"
            placeholder="Your full name"
            leftSection={<IconUser size={16} stroke={1.5} />}
            autoComplete="name"
            required
            minLength={2}
            value={fullName}
            onChange={(event) => setFullName(event.currentTarget.value)}
          />
          <Box>
            <Text size="sm" fw={600} mb={6}>Email</Text>
            <Group gap="xs" align="flex-start" wrap="nowrap" className="auth-email-row">
              <TextInput
                aria-label="Email"
                placeholder="you@example.com"
                leftSection={<IconAt size={16} stroke={1.5} />}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.currentTarget.value);
                  setSent(false);
                  setOtp("");
                }}
                style={{ flex: 1, minWidth: 0 }}
              />
              <LandingActionButton
                presentation="otp"
                type="button"
                loading={sendingOtp}
                disabled={!canSendOtp || countdown > 0}
                onClick={() => void sendOtp()}
                rightSection={!sendingOtp && <IconSend size={14} stroke={1.8} />}
                style={{ flexShrink: 0 }}
              >
                {sent ? countdown > 0 ? `Resend (${countdown}s)` : "Resend OTP" : "Send OTP"}
              </LandingActionButton>
            </Group>
          </Box>
          <TextInput
            label="Verification code"
            placeholder="Enter your 6-digit code"
            leftSection={<IconShield size={16} stroke={1.5} />}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            minLength={6}
            required
            disabled={!sent}
            value={otp}
            onChange={(event) => setOtp(event.currentTarget.value.replace(/\s/g, ""))}
          />
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            leftSection={<IconLock size={16} stroke={1.5} />}
            description="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <LandingActionButton
            presentation="auth"
            type="submit"
            fullWidth
            size="md"
            loading={submitting}
            disabled={!sent || otp.length !== 6}
            rightSection={!submitting && <IconArrowRight size={16} stroke={2.2} />}
          >
            Create account
          </LandingActionButton>
          <Text size="sm" ta="center">Already have an account? <Anchor component={Link} href="/login">Log in</Anchor></Text>
        </Stack>
      </form>
    </AuthFrame>
  );
}
