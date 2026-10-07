"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { StudyShell } from "@/components/study-shell";
import { StudyPageLoading } from "@/components/study-page-loading";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { ApiError } from "@/lib/api";
import { classDetailHref } from "@/lib/class-navigation";
import { getClassDetailData } from "../api";
import type { ClassDetailProps, ClassDetailSnapshot } from "../types";
import { CourseInfo } from "./CourseInfo";
import { CourseNavigation } from "./CourseNavigation";
import { SessionDetails } from "./SessionDetails";
import styles from "../class-detail.module.css";

export default function ClassDetailContent(props: ClassDetailProps) {
  const { id, kind, role, sessionId, from } = props;
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<ClassDetailSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const contentRef = useRef<HTMLElement>(null);
  const backHref = `/${from}?role=${role}`;
  const ready = !!snapshot;

  useEffect(() => {
    let current = true;
    getClassDetailData(role).then(({ profile, schedule, catalog }) => {
      if (!current) return;
      if (!profile.membership || profile.membership.status === "onboarding") {
        router.replace(`/onboarding?role=${role}`);
        return;
      }
      if (profile.membership.status === "rejected") {
        router.replace("/dashboard?role=teacher");
        return;
      }
      if (!schedule || !catalog) throw new Error("Your classes are not available yet.");
      const scheduledClass = kind === "class" ? schedule.classes.find((item) => item.id === id) ?? null : null;
      const request = kind === "request" ? schedule.requests.find((item) => item.id === id) ?? null : null;
      const programId = scheduledClass?.program_id ?? request?.program_id;
      const offeringId = scheduledClass?.offering_id ?? request?.offering_id;
      setSnapshot({
        profile, scheduledClass, request, program: catalog.items.find((item) => item.id === programId),
        subjectName: scheduledClass?.subject_name || catalog.subjects.find((item) => item.id === offeringId)?.name || "Class details",
        sessions: scheduledClass ? schedule.sessions.filter((item) => item.class_id === scheduledClass.id).sort((a, b) => a.session_number - b.session_number) : [],
        loadedAt: Date.now(),
      });
      setError(null);
    }).catch((cause) => {
      if (!current) return;
      if (cause instanceof ApiError && cause.status === 401) { router.replace("/login"); return; }
      setError(cause instanceof Error ? cause.message : "Unable to load class details.");
    });
    return () => { current = false; };
  }, [id, kind, role, router, loadAttempt]);

  useEffect(() => {
    if (!ready) return;
    contentRef.current?.focus({ preventScroll: true });
    if (sessionId !== null && window.matchMedia("(max-width: 800px)").matches) {
      contentRef.current?.scrollIntoView({ block: "start" });
    }
  }, [sessionId, ready]);

  function markSubmitted(sessionId: number, submittedAt: string) {
    setSnapshot((current) => current ? { ...current, sessions: current.sessions.map((item) =>
      item.id === sessionId ? { ...item, status: "completed", teaching_log_submitted_at: submittedAt } : item) } : current);
  }

  if (!snapshot) return <StudyShell state={null} role={role} mainClassName={styles.workspaceMain}>{error ? <div className={styles.page}><StudyCard p="xl"><Text c="red" role="alert">{error}</Text><Group mt="lg"><LandingActionButton tone="secondary" onClick={() => { setError(null); setLoadAttempt((value) => value + 1); }}>Try again</LandingActionButton><LandingActionButton tone="secondary" onClick={() => router.push(backHref)}>Go back</LandingActionButton></Group></StudyCard></div> : <StudyPageLoading label="Loading class details" />}</StudyShell>;
  if (!snapshot.scheduledClass && !snapshot.request) return <StudyShell state={snapshot.profile} role={role} mainClassName={styles.workspaceMain}><div className={styles.page}><StudyCard p="xl"><Title order={1} size="h2">Class not found</Title><Text c="dimmed" mt="sm">This class or request is not available in your {role} account.</Text><LandingActionButton tone="secondary" mt="lg" leftSection={<IconArrowLeft size={18} />} onClick={() => router.push(backHref)}>Back to {from === "dashboard" ? "dashboard" : "classes"}</LandingActionButton></StudyCard></div></StudyShell>;

  const session = snapshot.sessions.find((item) => item.id === sessionId);
  const sessionIndex = snapshot.sessions.findIndex((item) => item.id === sessionId);
  const previous = sessionIndex > 0 ? snapshot.sessions[sessionIndex - 1] : null;
  const next = sessionIndex >= 0 ? snapshot.sessions[sessionIndex + 1] : null;

  return <StudyShell state={snapshot.profile} role={role} mainClassName={styles.workspaceMain}>
    <div className={styles.page}>
      <div className={styles.pageToolbar}><LandingActionButton tone="secondary" size="sm" leftSection={<IconArrowLeft size={18} />} onClick={() => router.push(backHref)}>Back to {from === "dashboard" ? "dashboard" : "classes"}</LandingActionButton><Badge variant="light" color="yellow">All times in Jakarta (WIB)</Badge></div>
      <div className={styles.workspace}>
        <CourseNavigation {...props} snapshot={snapshot} />
        <section className={styles.detailContent} ref={contentRef} tabIndex={-1} aria-label={session ? `Session ${session.session_number} details` : "Course information"}>
          {sessionId === null ? <CourseInfo {...props} snapshot={snapshot} /> : session && snapshot.scheduledClass ? <>
            <div className={styles.sessionPaging}><LandingActionButton tone="secondary" size="xs" leftSection={<IconChevronLeft size={16} />} disabled={!previous} onClick={() => { if (previous) router.push(classDetailHref(id, role, previous.id, from), { scroll: false }); }}>Previous session</LandingActionButton><LandingActionButton tone="secondary" size="xs" rightSection={<IconChevronRight size={16} />} disabled={!next} onClick={() => { if (next) router.push(classDetailHref(id, role, next.id, from), { scroll: false }); }}>Next session</LandingActionButton></div>
            <SessionDetails key={session.id} session={session} scheduledClass={snapshot.scheduledClass} teacherView={role === "teacher"} userId={snapshot.profile.user.user_id} onSubmitted={markSubmitted} />
          </> : <StudyCard p="xl"><Stack gap="md"><Title order={1} size="h2">Session not found</Title><Text c="dimmed">This session is not part of this class. Choose a session from the list or return to the course information.</Text><Group><LandingActionButton tone="secondary" onClick={() => router.push(classDetailHref(id, role, undefined, from), { scroll: false })}>Course info</LandingActionButton></Group></Stack></StudyCard>}
        </section>
      </div>
    </div>
  </StudyShell>;
}
