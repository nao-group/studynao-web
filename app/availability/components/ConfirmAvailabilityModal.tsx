"use client";

import Image from "next/image";
import { Box, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { WeeklyBlock } from "@/lib/types";
import styles from "@/components/ui/confirmation-modal.module.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const time = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export function ConfirmAvailabilityModal({ opened, blocks, busy, onClose, onConfirm, submitForApproval = false }: {
  submitForApproval?: boolean;
  opened: boolean;
  blocks: WeeklyBlock[];
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return <Modal
    opened={opened}
    onClose={busy ? () => undefined : onClose}
    centered
    size={480}
    radius={24}
    padding={0}
    withCloseButton={!busy}
    closeOnClickOutside={!busy}
    closeOnEscape={!busy}
    aria-labelledby="confirm-availability-title"
    classNames={{ content: styles.content, header: styles.header, close: styles.close, body: styles.body }}
  >
    <Box className={styles.visual}>
      <Image src="/images/availability/submit-confirmation.png" alt="Weekly calendar and clock with selected times" width={1536} height={1024} sizes="(max-width: 480px) 100vw, 480px" className={styles.illustration} />
    </Box>
    <Stack className={styles.details} gap={0} align="center">
      <Box className={styles.eyebrow}><IconCheck size={14} stroke={2.4} /> Final check</Box>
      <Text id="confirm-availability-title" className={styles.title} fz={26} fw={800} ta="center">Submit your availability?</Text>
      <Text className={styles.description} mt={10} size="sm" ta="center" lh={1.65}>{submitForApproval ? "Submit your profile and selected weekly times together for admin approval. You can teach once your application is approved." : "These weekly times will replace your previous availability. An admin will use them to match your private class schedule."}</Text>
      <Box className={styles.summary}>
        <Text fw={750} className={styles.classCode}>{blocks.length} selected time block{blocks.length === 1 ? "" : "s"}</Text>
        <Text size="xs" className={styles.schedule}>All times are in Jakarta (WIB).</Text>
        <Box className={styles.summaryList}>
          {blocks.map((block) => <Text key={`${block.weekday}-${block.start_minute}`} className={styles.summaryItem} size="sm">{days[block.weekday]} {time(block.start_minute)}–{time(block.end_minute)}</Text>)}
        </Box>
      </Box>
      <Group grow w="100%" mt={22} gap={12} className={styles.actions}>
        <LandingActionButton tone="secondary" leftSection={<IconChevronLeft size={16} />} onClick={onClose} disabled={busy}>Review times</LandingActionButton>
        <LandingActionButton rightSection={<IconArrowRight size={16} />} onClick={onConfirm} loading={busy} disabled={blocks.length === 0}>Yes, submit</LandingActionButton>
      </Group>
    </Stack>
  </Modal>;
}
