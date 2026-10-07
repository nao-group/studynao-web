"use client";

import Link from "next/link";
import { Badge, Box, Group, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconCalendarEvent, IconChevronRight, IconClockHour4 } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import type { ClassRequest, Program, Subject } from "@/lib/types";
import { classDetailHref, classRequestHref } from "@/lib/class-navigation";
import { displayDate } from "../data";
import type { AssignedClassesProps } from "../types";
import styles from "./assigned-classes.module.css";

function subjectName(offeringId: number, subjects: Subject[], fallback?: string) {
  return fallback || subjects.find((subject) => subject.id === offeringId)?.name || "Subject";
}

function programFor(request: ClassRequest, programs: Program[]) {
  return programs.find((program) => program.id === request.program_id);
}

export function AssignedClasses({ role, classes, requests, programs, subjects }: AssignedClassesProps) {
  const pending = role === "student" ? requests : [];

  return <div>
    <Title order={2} size="h3" mb="sm">{role === "teacher" ? "Assigned classes" : "Your current classes"}</Title>
    {pending.length || classes.length ? <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {pending.map((item) => { const packageInfo = programFor(item, programs); return <UnstyledButton key={`request-${item.id}`} className={styles.classButton} component={Link} href={classRequestHref(item.id, role)} aria-label={`View pending request for ${subjectName(item.offering_id, subjects)}`}><StudyCard className={styles.entryCard} p="lg"><Stack gap="sm"><Group justify="space-between" align="start" wrap="nowrap"><Box className={styles.entryIcon}><IconClockHour4 size={20} /></Box><Badge color="yellow" variant="light">Pending</Badge></Group><Text fw={700} size="lg">{subjectName(item.offering_id, subjects)}</Text><Text size="sm" c="dimmed">{packageInfo ? `${packageInfo.class_type === "private" ? "Private" : "Group"} · ${packageInfo.teaching_language}` : "Class request"}</Text><Group justify="space-between" mt="auto"><Text size="sm" c="dimmed">Preferred start {displayDate(item.preferred_start_date)}</Text><IconChevronRight size={17} /></Group></Stack></StudyCard></UnstyledButton>; })}
      {classes.map((item) => <UnstyledButton key={`class-${item.id}`} className={styles.classButton} component={Link} href={classDetailHref(item.id, role)} aria-label={`View details for class ${item.code}`}><StudyCard className={styles.entryCard} p="lg"><Stack gap="sm"><Group justify="space-between" align="start" wrap="nowrap"><Box className={styles.entryIcon}><IconCalendarEvent size={20} /></Box><Badge color="teal" variant="light">{item.status || "Scheduled"}</Badge></Group><Text fw={700} size="lg">{subjectName(item.offering_id, subjects, item.subject_name)}</Text><Text size="sm" c="dimmed">{item.code} · {item.class_type === "private" ? "Private" : "Group"}</Text><Group justify="space-between" mt="auto"><Text size="sm" c="dimmed">Starts {displayDate(item.first_date)}</Text><IconChevronRight size={17} /></Group></Stack></StudyCard></UnstyledButton>)}
    </SimpleGrid> : <StudyCard p="lg"><Text size="sm" c="dimmed">No classes or pending requests yet.</Text></StudyCard>}

  </div>;
}
