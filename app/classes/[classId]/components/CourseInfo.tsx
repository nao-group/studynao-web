"use client";

import { Badge, Box, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconCalendarEvent, IconSchool } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { classDetailHref } from "@/lib/class-navigation";
import { displayDate } from "../../data";
import { sessionDate, sessionTime } from "../data";
import type { ClassDetailProps, ClassDetailSnapshot } from "../types";
import styles from "../class-detail.module.css";

function Detail({ label, value }: { label: string; value: string | number }) {
  return <Box className={styles.infoField}><Text size="sm" c="dimmed">{label}</Text><Text fw={600} mt={5}>{value}</Text></Box>;
}

export function CourseInfo({ snapshot, id, role, kind, from }: ClassDetailProps & { snapshot: ClassDetailSnapshot }) {
  const router = useRouter();
  const { scheduledClass, request, program, subjectName, sessions, loadedAt } = snapshot;
  const upcoming = sessions.find((session) => session.status !== "cancelled" && new Date(session.ends_at).getTime() > loadedAt);
  const completed = sessions.filter((session) => session.status === "completed").length;
  const duration = program?.duration_minutes ?? (sessions[0] ? Math.round((new Date(sessions[0].ends_at).getTime() - new Date(sessions[0].starts_at).getTime()) / 60000) : null);
  const classType = scheduledClass?.class_type ?? program?.class_type;
  return <Stack gap="lg">
    <StudyCard p={{ base: "lg", sm: "xl" }}>
      <Group align="start" gap="lg" wrap="nowrap"><div className={styles.heroIcon}><IconSchool size={37} stroke={1.5} aria-hidden="true" /></div><div className={styles.heroTitle}><Text className={styles.eyebrow}>Course info</Text><Title order={1} className={styles.title}>{subjectName}</Title><Text c="dimmed" mt="xs">{scheduledClass?.code ?? `Class request #${request?.id}`}</Text><Group gap="xs" mt="md"><Badge variant="light" color={request ? "yellow" : "teal"}>{request ? "Pending scheduling" : scheduledClass?.status}</Badge>{classType && <Badge variant="outline">{classType === "private" ? "Private" : "Group"}</Badge>}<Badge variant="outline">{scheduledClass?.teaching_language ?? program?.teaching_language ?? "Language to be confirmed"}</Badge></Group></div></Group>
      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md" mt="xl">
        <div className={styles.stat}><Text size="sm" c="dimmed">Total sessions</Text><Text className={styles.statValue}>{request ? program?.session_count ?? "—" : sessions.length}</Text></div>
        <div className={styles.stat}><Text size="sm" c="dimmed">Completed sessions</Text><Text className={styles.statValue}>{completed}</Text></div>
        <div className={styles.stat}><Text size="sm" c="dimmed">Session duration</Text><Text className={styles.statValue}>{duration ?? "—"}<Text component="span" size="sm" c="dimmed" ml={6}>min</Text></Text></div>
      </SimpleGrid>
    </StudyCard>
    <StudyCard p={{ base: "lg", sm: "xl" }}><Title order={2} size="h3" mb="lg">{request ? "Request details" : "Class details"}</Title>
      {request ? <><Text c="dimmed" mb="lg">{program?.class_type === "private" ? "An admin will match your availability with a teacher and confirm your private class schedule." : "Choose an available group class that fits your timetable. Your sessions will appear here after you enroll."}</Text><SimpleGrid cols={{ base: 1, sm: 2 }}><Detail label="Class type" value={program ? program.class_type === "private" ? "Private" : "Group" : "To be confirmed"} /><Detail label="Preferred first class" value={displayDate(request.preferred_start_date)} /><Detail label="Requested on" value={sessionDate(request.created_at)} /><Detail label="Request status" value={request.status === "pending" ? "Pending" : request.status} /></SimpleGrid><Group mt="lg"><LandingActionButton tone="secondary" onClick={() => router.push(program?.class_type === "private" ? "/availability?role=student" : "/classes?role=student")}>{program?.class_type === "private" ? "Review availability" : "Browse group classes"}</LandingActionButton></Group></> : scheduledClass && <SimpleGrid cols={{ base: 1, sm: 2 }}><Detail label="Teacher" value={scheduledClass.teacher_name || "To be confirmed"} /><Detail label="Teaching language" value={scheduledClass.teaching_language} /><Detail label="First class" value={displayDate(scheduledClass.first_date)} /><Detail label="Last class" value={scheduledClass.final_date ? displayDate(scheduledClass.final_date) : "To be confirmed"} />{role === "teacher" && <Detail label="Students" value={scheduledClass.student_names?.filter(Boolean).join(", ") || "No students enrolled yet"} />}<Detail label="Class format" value={scheduledClass.class_type === "private" ? "One student · one teacher" : `Group · up to ${scheduledClass.capacity} students`} /></SimpleGrid>}
    </StudyCard>
    {kind === "class" && <StudyCard p={{ base: "lg", sm: "xl" }}><Group gap="md" mb="sm"><IconCalendarEvent size={22} aria-hidden="true" /><Title order={2} size="h3">{upcoming ? "Your next session" : "Session schedule"}</Title></Group><Text c="dimmed">{upcoming ? `Session ${upcoming.session_number} · ${sessionDate(upcoming.starts_at)} · ${sessionTime(upcoming.starts_at)}–${sessionTime(upcoming.ends_at)} WIB` : "There are no upcoming sessions. You can review previous sessions in the list on the left."}</Text>{upcoming && <Group mt="lg"><LandingActionButton rightSection={<IconArrowRight size={18} />} onClick={() => router.push(classDetailHref(id, role, upcoming.id, from), { scroll: false })}>View session</LandingActionButton></Group>}</StudyCard>}
  </Stack>;
}
