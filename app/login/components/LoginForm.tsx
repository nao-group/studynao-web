import Link from "next/link";
import { Anchor, PasswordInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { IconArrowRight, IconAt, IconLock } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { LoginFormProps } from "../types";

export function LoginForm(props: LoginFormProps) {
  return <form onSubmit={props.onSubmit}><Stack>
    <Text size="sm" fw={600}>Log in as</Text>
    <SegmentedControl fullWidth value={props.role} onChange={(value) => props.onRoleChange(value as LoginFormProps["role"])} data={[{ value: "student", label: "Student" }, { value: "teacher", label: "Teacher" }]} />
    <TextInput label="Email" placeholder="you@example.com" leftSection={<IconAt size={16} stroke={1.5} />} type="email" autoComplete="email" required value={props.email} onChange={(event) => props.onEmailChange(event.currentTarget.value)} />
    <PasswordInput label="Password" placeholder="••••••••" leftSection={<IconLock size={16} stroke={1.5} />} autoComplete="current-password" required value={props.password} onChange={(event) => props.onPasswordChange(event.currentTarget.value)} />
    <Anchor size="sm" onClick={props.onForgotPassword}>Forgot password?</Anchor>
    <LandingActionButton presentation="auth" type="submit" fullWidth size="md" loading={props.busy} rightSection={!props.busy && <IconArrowRight size={16} stroke={2.2} />}>Log in</LandingActionButton>
    <Text size="sm" ta="center">New to Nao Academy? <Anchor component={Link} href="/register">Sign up</Anchor></Text>
  </Stack></form>;
}
