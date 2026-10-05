"use client";

import Image from "next/image";
import { Box, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { GroupOption } from "@/lib/types";
import { displayDate } from "../data";
import styles from "@/components/ui/confirmation-modal.module.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const time = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export function ChooseClassModal({ selectedClass, subjectName, busy, onClose, onConfirm }: {
  selectedClass: GroupOption | null;
  subjectName?: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return <Modal
    opened={Boolean(selectedClass)}
    onClose={busy ? () => undefined : onClose}
    centered
    size={480}
    radius={24}
    padding={0}
    withCloseButton={!busy}
    closeOnClickOutside={!busy}
    closeOnEscape={!busy}
    aria-labelledby="choose-class-title"
    classNames={{ content: styles.content, header: styles.header, close: styles.close, body: styles.body }}
  >
    <Box className={styles.visual}>
      <Image src="/images/classes/group-class-confirmation.png" alt="Students preparing to learn together" width={1691} height={930} sizes="(max-width: 480px) 100vw, 480px" className={styles.illustration} />
    </Box>
    <Stack className={styles.details} gap={0} align="center">
      <Box className={styles.eyebrow}><IconCheck size={14} stroke={2.4} /> Final check</Box>
      <Text id="choose-class-title" className={styles.title} fz={26} fw={800} ta="center">Ready to join this class?</Text>
      <Text className={styles.description} mt={10} size="sm" ta="center" lh={1.65}>Review the class details before you confirm your place.</Text>
      {selectedClass && <Box className={styles.summary}>
        <Text fw={750} className={styles.classCode}>{selectedClass.code}</Text>
        <Text size="sm">{selectedClass.subject_name || subjectName || "Group class"} · {selectedClass.teaching_language}</Text>
        <Text size="sm">Teacher: {selectedClass.teacher_name || "To be announced"}</Text>
        <Text size="sm">Starts {displayDate(selectedClass.first_date)} · {selectedClass.seats_available} seat{selectedClass.seats_available === 1 ? "" : "s"} left</Text>
        {selectedClass.slots.length > 0 && <Text className={styles.schedule} size="xs">{selectedClass.slots.map((slot) => `${days[slot.weekday]} ${time(slot.start_minute)}–${time(slot.end_minute)}`).join(" · ")} WIB</Text>}
      </Box>}
      <Group grow w="100%" mt={22} gap={12} className={styles.actions}>
        <LandingActionButton tone="secondary" leftSection={<IconChevronLeft size={16} />} onClick={onClose} disabled={busy}>Review classes</LandingActionButton>
        <LandingActionButton rightSection={<IconArrowRight size={16} />} onClick={onConfirm} loading={busy} disabled={!selectedClass}>Yes, choose class</LandingActionButton>
      </Group>
    </Stack>
  </Modal>;
}
