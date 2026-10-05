"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { IconArrowRight, IconCalendarEvent, IconClock, IconSchool } from "@tabler/icons-react";
import { StudyShell } from "@/components/study-shell";
import { StudyPageLoading } from "@/components/study-page-loading";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { needsPrivateAvailability } from "@/lib/scheduling";
import type { Role } from "@/lib/types";
import { notifyError } from "@/lib/feedback";
import { getDashboardData } from "../api";
import type { DashboardSnapshot } from "../types";

export default function DashboardContent() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);

  useEffect(() => {
    const requestedRole: Role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getDashboardData(requestedRole)
      .then(({ profile: person, schedule: calendar }) => {
        if (!person.membership || person.membership.status === "onboarding") { router.replace(`/onboarding?role=${requestedRole}`); return; }
        if (needsPrivateAvailability(person, calendar)) { router.replace(`/availability?role=${requestedRole}`); return; }
        if (requestedRole === "student" && !calendar.requests.length && !calendar.classes.length) { router.replace("/classes?role=student"); return; }
        setSnapshot({ role: requestedRole, profile: person, schedule: calendar, loadedAt: Date.now() });
      })
      .catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Unable to load your dashboard."); router.replace("/login"); });
  }, [router]);

  if (!snapshot) return <StudyShell state={null}><StudyPageLoading label="Loading dashboard" /></StudyShell>;
  const { role, profile, schedule, loadedAt } = snapshot;
  const teacher = role === "teacher";
  const pending = profile.membership?.status === "pending_verification";
  const rejected = profile.membership?.status === "rejected";
  const upcoming = schedule.sessions.filter((session) => new Date(session.starts_at).getTime() >= loadedAt);
  const nextSession = upcoming[0];
  return <StudyShell state={profile}><Stack gap="xl" p={{ base: "md", sm: "xl" }} maw={1350} w="100%" mx="auto">
    <div><Text size="xs" fw={700} c="yellow.7" tt="uppercase" style={{ letterSpacing: ".14em" }}>{teacher ? "TEACHER PORTAL" : "STUDENT PORTAL"}</Text><Title order={1} mt={5}>Your learning space.</Title><Text c="dimmed" mt={6}>Your classes and schedule, all in one place.</Text></div>
    {pending && <Alert color="yellow" title="Teacher verification">Your profile is under admin review. You can update your private availability while you wait.</Alert>}
    {rejected && <Alert color="red" title="Application not approved">You can update your details and apply again.<LandingActionButton tone="secondary" mt="sm" onClick={() => router.push("/onboarding?role=teacher")}>Update profile</LandingActionButton></Alert>}
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      <div className="dash-hero"><IconSchool size={23} color="#d4a017" /><Text size="sm" c="dimmed" mt="md">{teacher ? "Teaching classes" : "Enrolled classes"}</Text><Title order={2}>{schedule.classes.length}</Title></div>
      <div className="dash-hero"><IconCalendarEvent size={23} color="#d4a017" /><Text size="sm" c="dimmed" mt="md">Upcoming sessions</Text><Title order={2}>{upcoming.length}</Title></div>
      <div className="dash-hero"><IconClock size={23} color="#d4a017" /><Text size="sm" c="dimmed" mt="md">Next session</Text><Title order={2} size="h3">{nextSession ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(nextSession.starts_at)) : "Not scheduled"}</Title></div>
    </SimpleGrid>
    {!teacher && !schedule.classes.length && !schedule.requests.length && <Alert color="blue" title="Ready to begin?">Choose private or group classes and select your subjects.<LandingActionButton mt="sm" rightSection={<IconArrowRight size={16} />} onClick={() => router.push("/classes?role=student")}>Choose classes</LandingActionButton></Alert>}
    {!teacher && schedule.requests.some((request) => request.status === "pending") && <Group><Badge color="yellow" variant="light">{schedule.requests.filter((request) => request.status === "pending").length} requests waiting for scheduling</Badge><LandingActionButton tone="secondary" size="sm" onClick={() => router.push("/classes?role=student")}>View requests</LandingActionButton></Group>}
    <ScheduleCalendar classes={schedule.classes} sessions={schedule.sessions} teacherView={teacher} />
  </Stack></StudyShell>;
}
