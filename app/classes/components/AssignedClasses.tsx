"use client";

import { useState } from "react";
import { Badge, Box, Drawer, Group, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconCalendarEvent, IconChevronRight, IconClockHour4 } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import type { ClassRequest, Program, ScheduledClass, Subject } from "@/lib/types";
import { displayDate } from "../data";
import type { AssignedClassesProps } from "../types";
import styles from "./assigned-classes.module.css";

type Selection = { kind: "request"; item: ClassRequest } | { kind: "class"; item: ScheduledClass };

function Detail({ label, value }: { label: string; value: string | number }) {
  return <Box className={styles.detail}><Text size="xs" c="dimmed">{label}</Text><Text fw={600}>{value}</Text></Box>;
}

function subjectName(offeringId: number, subjects: Subject[], fallback?: string) {
  return fallback || subjects.find((subject) => subject.id === offeringId)?.name || "Subject";
}

function programFor(request: ClassRequest, programs: Program[]) {
  return programs.find((program) => program.id === request.program_id);
}

export function AssignedClasses({ role, classes, requests, programs, subjects }: AssignedClassesProps) {
  const [selected, setSelected] = useState<Selection | null>(null);
  const pending = role === "student" ? requests : [];
  const request = selected?.kind === "request" ? selected.item : null;
  const scheduled = selected?.kind === "class" ? selected.item : null;
  const program = request ? programFor(request, programs) : undefined;
  const title = request ? subjectName(request.offering_id, subjects) : scheduled ? subjectName(scheduled.offering_id, subjects, scheduled.subject_name) : "Class details";

  return <div>
    <Title order={2} size="h3" mb="sm">{role === "teacher" ? "Assigned classes" : "Your current classes"}</Title>
    {pending.length || classes.length ? <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {pending.map((item) => { const packageInfo = programFor(item, programs); return <UnstyledButton key={`request-${item.id}`} className={styles.classButton} onClick={() => setSelected({ kind: "request", item })} aria-label={`View pending request for ${subjectName(item.offering_id, subjects)}`}><StudyCard className={styles.entryCard} p="lg"><Stack gap="sm"><Group justify="space-between" align="start" wrap="nowrap"><Box className={styles.entryIcon}><IconClockHour4 size={20} /></Box><Badge color="yellow" variant="light">Pending</Badge></Group><Text fw={700} size="lg">{subjectName(item.offering_id, subjects)}</Text><Text size="sm" c="dimmed">{packageInfo ? `${packageInfo.class_type === "private" ? "Private" : "Group"} · ${packageInfo.teaching_language}` : "Class request"}</Text><Group justify="space-between" mt="auto"><Text size="sm" c="dimmed">Preferred start {displayDate(item.preferred_start_date)}</Text><IconChevronRight size={17} /></Group></Stack></StudyCard></UnstyledButton>; })}
      {classes.map((item) => <UnstyledButton key={`class-${item.id}`} className={styles.classButton} onClick={() => setSelected({ kind: "class", item })} aria-label={`View details for class ${item.code}`}><StudyCard className={styles.entryCard} p="lg"><Stack gap="sm"><Group justify="space-between" align="start" wrap="nowrap"><Box className={styles.entryIcon}><IconCalendarEvent size={20} /></Box><Badge color="teal" variant="light">{item.status || "Scheduled"}</Badge></Group><Text fw={700} size="lg">{subjectName(item.offering_id, subjects, item.subject_name)}</Text><Text size="sm" c="dimmed">{item.code} · {item.class_type === "private" ? "Private" : "Group"}</Text><Group justify="space-between" mt="auto"><Text size="sm" c="dimmed">Starts {displayDate(item.first_date)}</Text><IconChevronRight size={17} /></Group></Stack></StudyCard></UnstyledButton>)}
    </SimpleGrid> : <StudyCard p="lg"><Text size="sm" c="dimmed">No classes or pending requests yet.</Text></StudyCard>}

    <Drawer opened={selected !== null} onClose={() => setSelected(null)} position="right" size="md" title="Class details" classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody }}>
      {selected && <Stack gap="lg"><Box><Text size="xs" fw={700} c="yellow.7" tt="uppercase" style={{ letterSpacing: ".12em" }}>{request ? "Class request" : "Scheduled class"}</Text><Title order={2} mt={6}>{title}</Title><Badge color={request ? "yellow" : "teal"} variant="light" mt="sm">{request ? "Pending" : scheduled?.status || "Scheduled"}</Badge></Box>
        {request ? <><Text size="sm" c="dimmed">Your request is waiting for a class schedule. We’ll update it when the schedule is finalized.</Text><SimpleGrid cols={2} spacing="sm"><Detail label="Class type" value={program ? program.class_type === "private" ? "Private" : "Group" : "To be confirmed"} /><Detail label="Language" value={program?.teaching_language || "To be confirmed"} /><Detail label="Preferred first class" value={displayDate(request.preferred_start_date)} /><Detail label="Request status" value="Pending" />{program && <><Detail label="Sessions" value={program.session_count} /><Detail label="Duration per session" value={`${program.duration_minutes} minutes`} /></>}<Detail label="Requested on" value={new Date(request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })} /><Detail label="Request ID" value={`#${request.id}`} /></SimpleGrid></> : scheduled && <><SimpleGrid cols={2} spacing="sm"><Detail label="Class code" value={scheduled.code} /><Detail label="Class type" value={scheduled.class_type === "private" ? "Private" : "Group"} /><Detail label="Language" value={scheduled.teaching_language} /><Detail label="First class" value={displayDate(scheduled.first_date)} /><Detail label="Last class" value={scheduled.final_date ? displayDate(scheduled.final_date) : "To be confirmed"} /><Detail label={role === "teacher" ? "Students" : "Teacher"} value={role === "teacher" ? scheduled.student_names?.join(", ") || "To be confirmed" : scheduled.teacher_name || "To be confirmed"} /></SimpleGrid></>}
      </Stack>}
    </Drawer>
  </div>;
}
