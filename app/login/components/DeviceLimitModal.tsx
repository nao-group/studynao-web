import { Modal, Radio, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { DeviceLimitModalProps } from "../types";

export function DeviceLimitModal(props: DeviceLimitModalProps) {
  return <Modal opened={Boolean(props.pending)} onClose={props.onClose} title="Device limit reached">
    <Stack><Text size="sm">Choose a device to sign out so you can log in on this one.</Text>
      <Radio.Group value={props.selected} onChange={props.onSelectedChange}><Stack>{props.pending?.sessions.map((item) => <Radio key={item.session_id} value={item.session_id} label={item.device} />)}</Stack></Radio.Group>
      <LandingActionButton loading={props.busy} onClick={props.onRevoke} rightSection={!props.busy && <IconArrowRight size={16} stroke={2.2} />}>Sign out device and log in</LandingActionButton>
    </Stack>
  </Modal>;
}
