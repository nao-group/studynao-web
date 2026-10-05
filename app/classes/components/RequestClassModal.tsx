"use client";

import Image from "next/image";
import { Box, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { Program, Subject } from "@/lib/types";
import { displayDate } from "../data";
import styles from "@/components/ui/confirmation-modal.module.css";

export function RequestClassModal({ opened, program, subjects, firstDate, busy, onClose, onConfirm }: {
  opened: boolean;
  program: Program | undefined;
  subjects: Subject[];
  firstDate: string;
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
    aria-labelledby="request-class-title"
    classNames={{ content: styles.content, header: styles.header, close: styles.close, body: styles.body }}
  >
    <Box className={styles.visual}>
      <Image src="/images/classes/class-request-confirmation.png" alt="Student selecting subjects and a preferred class date" width={1730} height={909} sizes="(max-width: 480px) 100vw, 480px" className={styles.illustration} />
    </Box>
    <Stack className={styles.details} gap={0} align="center">
      <Box className={styles.eyebrow}><IconCheck size={14} stroke={2.4} /> Final check</Box>
      <Text id="request-class-title" className={styles.title} fz={26} fw={800} ta="center">Ready to request your class?</Text>
      <Text className={styles.description} mt={10} size="sm" ta="center" lh={1.65}>We’ll create one request for each subject below.</Text>
      {program && <Box className={styles.summary}>
        <Text fw={750} className={styles.classCode}>{program.class_type === "private" ? "Private" : "Group"} · {program.subject} · {program.teaching_language}</Text>
        <Text size="sm">{program.session_count} sessions · {program.duration_minutes} minutes each</Text>
        <Text size="sm">Preferred first class: {displayDate(firstDate)}</Text>
        <Text size="sm" fw={700}>{subjects.length} class request{subjects.length === 1 ? "" : "s"}</Text>
        <Text className={styles.schedule} size="xs">{subjects.map((subject) => subject.name).join(" · ")}</Text>
      </Box>}
      <Group grow w="100%" mt={22} gap={12} className={styles.actions}>
        <LandingActionButton tone="secondary" leftSection={<IconChevronLeft size={16} />} onClick={onClose} disabled={busy}>Review details</LandingActionButton>
        <LandingActionButton rightSection={<IconArrowRight size={16} />} onClick={onConfirm} loading={busy} disabled={!program || subjects.length === 0 || !firstDate}>Yes, submit request</LandingActionButton>
      </Group>
    </Stack>
  </Modal>;
}
