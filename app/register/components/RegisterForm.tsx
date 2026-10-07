import Link from "next/link";
import { Anchor, Box, Group, PasswordInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { IconArrowRight, IconAt, IconLock, IconSend, IconShield, IconUser } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { RegisterFormProps } from "../types";

export function RegisterForm(props: RegisterFormProps) {
  return <form onSubmit={props.onSubmit}><Stack gap="lg">
    <Text size="sm" fw={600}>Sign up as</Text>
    <SegmentedControl fullWidth value={props.role} onChange={(value) => props.onRoleChange(value as RegisterFormProps["role"])} data={[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }]} />
    <TextInput label="Full name" placeholder="Your full name" leftSection={<IconUser size={16} stroke={1.5} />} autoComplete="name" required minLength={2} value={props.fullName} onChange={(event) => props.onFullNameChange(event.currentTarget.value)} />
    <Box>
      <Text size="sm" fw={600} mb={6}>Email</Text>
      <Group gap="xs" align="flex-start" wrap="nowrap" className="auth-email-row">
        <TextInput aria-label="Email" placeholder="you@example.com" leftSection={<IconAt size={16} stroke={1.5} />} type="email" autoComplete="email" required value={props.email} onChange={(event) => props.onEmailChange(event.currentTarget.value)} style={{ flex: 1, minWidth: 0 }} />
        <LandingActionButton presentation="otp" type="button" loading={props.sendingOtp} disabled={!props.canSendOtp || props.countdown > 0} onClick={props.onSendOtp} rightSection={!props.sendingOtp && <IconSend size={14} stroke={1.8} />} style={{ flexShrink: 0 }}>
          {props.sent ? props.countdown > 0 ? `Resend (${props.countdown}s)` : "Resend OTP" : "Send OTP"}
        </LandingActionButton>
      </Group>
    </Box>
    <TextInput label="Verification code" placeholder="Enter your 6-digit code" leftSection={<IconShield size={16} stroke={1.5} />} inputMode="numeric" autoComplete="one-time-code" maxLength={6} minLength={6} required disabled={!props.sent} value={props.otp} onChange={(event) => props.onOtpChange(event.currentTarget.value.replace(/\D/g, ""))} />
    <PasswordInput label="Password" placeholder="At least 8 characters" leftSection={<IconLock size={16} stroke={1.5} />} description="At least 8 characters" autoComplete="new-password" required minLength={8} value={props.password} onChange={(event) => props.onPasswordChange(event.currentTarget.value)} />
    <LandingActionButton presentation="auth" type="submit" fullWidth size="md" loading={props.submitting} disabled={!props.canCreateAccount} rightSection={!props.submitting && <IconArrowRight size={16} stroke={2.2} />}>Create account</LandingActionButton>
    <Text size="sm" ta="center">Already have an account? <Anchor component={Link} href="/login">Log in</Anchor></Text>
  </Stack></form>;
}
