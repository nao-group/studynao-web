"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthFrame } from "@/components/auth-frame";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { registerAccount, sendRegistrationOtp } from "../api";
import type { Role } from "@/lib/types";
import { RegisterForm } from "./RegisterForm";

export default function RegisterContent() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
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
      await sendRegistrationOtp(fullName.trim(), email.trim());
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
      await registerAccount({ full_name: fullName.trim(), email: email.trim(), password, otp, studynao_role: role });
      notifySuccess("Account created!", "You’re all set. Please log in to continue.");
      router.replace("/login");
    } catch (cause) {
      notifyError(cause instanceof Error ? cause.message : "Registration failed.", "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canSendOtp = fullName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return <AuthFrame mode="register" title="Create your StudyNao account" description="Choose your role. Teachers need admin approval before they can teach.">
    <RegisterForm
      role={role} fullName={fullName} email={email} password={password} otp={otp} sent={sent} countdown={countdown}
      sendingOtp={sendingOtp} submitting={submitting} canSendOtp={canSendOtp}
      onRoleChange={setRole} onFullNameChange={setFullName}
      onEmailChange={(value) => { setEmail(value); setSent(false); setOtp(""); }}
      onPasswordChange={setPassword} onOtpChange={setOtp} onSendOtp={() => void sendOtp()} onSubmit={submit}
    />
  </AuthFrame>;
}
