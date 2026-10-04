import { Anchor, Modal, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconAt, IconMail } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { ForgotPasswordModalProps } from "../types";

export function ForgotPasswordModal(props: ForgotPasswordModalProps) {
  return <Modal opened={props.opened} onClose={props.onClose} centered radius="xl" padding="xl" size="md" title="Reset your password" classNames={{ content: "reset-modal", header: "reset-modal-header" }} styles={{ title: { fontSize: "1.5rem", fontWeight: 700 }, header: { alignItems: "flex-start" } }}>
    {props.sentTo ? <Stack align="center" gap="md" ta="center" py="md">
      <ThemeIcon size={112} radius="xl" color="yellow" variant="light" className="reset-modal-icon"><IconMail size={44} stroke={1.5} /></ThemeIcon>
      <Text fw={700} size="xl" mt="sm">Check your inbox</Text>
      <Text>We sent a password reset link to <b>{props.sentTo}</b>. The link expires in 15 minutes.</Text>
      <Text size="sm">Didn&apos;t receive it? Check your spam folder or <Anchor fw={700} inherit onClick={props.onTryAgain}>try again</Anchor>.</Text>
    </Stack> : <form onSubmit={props.onSubmit}><Stack gap="lg">
      <Text c="dimmed">Enter the email address for your account and we&apos;ll send you a reset link.</Text>
      <TextInput label="Email address" placeholder="you@example.com" leftSection={<IconAt size={16} stroke={1.5} />} type="email" autoComplete="email" required value={props.email} onChange={(event) => props.onEmailChange(event.currentTarget.value)} />
      <LandingActionButton presentation="auth" type="submit" fullWidth loading={props.busy} disabled={!props.email.trim()} rightSection={!props.busy && <IconArrowRight size={16} stroke={2.2} />}>Send reset link</LandingActionButton>
    </Stack></form>}
  </Modal>;
}
