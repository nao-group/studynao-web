"use client";

import Link from "next/link";
import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import { IconBook2, IconCheck, IconChevronRight, IconClock, IconSchool, IconX } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import { classDetailHref, classRequestHref } from "@/lib/class-navigation";
import type { ClassDetailProps, ClassDetailSnapshot } from "../types";
import { sessionDate, sessionTime } from "../data";
import styles from "../class-detail.module.css";

export function CourseNavigation({ snapshot, id, kind, role, sessionId, from }: ClassDetailProps & { snapshot: ClassDetailSnapshot }) {
  const { scheduledClass, request, subjectName, sessions } = snapshot;
  const infoHref = kind === "request" ? classRequestHref(id, role) : classDetailHref(id, role, undefined, from);
  return <aside className={styles.sidebar}><StudyCard p={0} className={styles.sidebarCard}>
    <Stack gap="sm" className={styles.courseIdentity}>
      <Group gap="sm" wrap="nowrap"><div className={styles.courseIcon}><IconSchool size={25} stroke={1.6} aria-hidden="true" /></div><Text fw={700} size="lg">{subjectName}</Text></Group>
      <Text size="sm" c="dimmed">{scheduledClass?.code ?? `Class request #${request?.id}`}</Text>
      <Group gap="xs"><Badge variant="light" color={request ? "yellow" : "teal"}>{request ? "Pending" : scheduledClass?.status}</Badge><Text size="xs" c="dimmed">{sessions.length} sessions</Text></Group>
    </Stack>
    <Divider />
    <nav aria-label="Course navigation" className={styles.navigation}>
      <Link href={infoHref} scroll={false} className={styles.infoLink} data-active={sessionId === null || undefined} aria-current={sessionId === null ? "page" : undefined}>
        <IconBook2 size={20} stroke={1.7} aria-hidden="true" /><span>Course info</span><IconChevronRight size={17} aria-hidden="true" />
      </Link>
      <div className={styles.sessionHeading}><Text size="xs" fw={700} tt="uppercase" c="dimmed">Sessions</Text><Badge variant="outline" size="sm">{sessions.length}</Badge></div>
      {sessions.length ? <div className={styles.sessionList}>
        {sessions.map((session) => {
          const completed = session.status === "completed" || !!session.teaching_log_submitted_at;
          const cancelled = session.status === "cancelled";
          const Icon = cancelled ? IconX : completed ? IconCheck : IconClock;
          const status = cancelled ? "Cancelled" : completed ? "Completed" : "Scheduled";
          return <Link key={session.id} href={classDetailHref(id, role, session.id, from)} scroll={false}
            className={styles.sessionLink} data-active={sessionId === session.id || undefined}
            aria-current={sessionId === session.id ? "page" : undefined}>
            <span className={styles.sessionNumber}>{String(session.session_number).padStart(2, "0")}</span>
            <span className={styles.sessionLabel}><Text component="span" fw={600} size="sm">Session {session.session_number}</Text><Text component="span" size="xs" c="dimmed">{sessionDate(session.starts_at)}</Text><Text component="span" size="xs" c="dimmed">{sessionTime(session.starts_at)}–{sessionTime(session.ends_at)} WIB</Text></span>
            <Icon className={styles.sessionStatus} size={17} stroke={1.8} aria-label={status} />
          </Link>;
        })}
      </div> : <div className={styles.emptySessions}><IconClock size={21} aria-hidden="true" /><Text fw={600} size="sm">No sessions scheduled yet</Text><Text size="sm" c="dimmed">Your sessions will appear here when your class schedule is confirmed.</Text></div>}
    </nav>
  </StudyCard></aside>;
}
