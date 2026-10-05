"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Group, Stack, Text, Title } from "@mantine/core";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { IconArrowRight } from "@tabler/icons-react";
import { StudyShell } from "@/components/study-shell";
import { StudyPaper } from "@/components/ui/study-surface";
import { StudyPageLoading } from "@/components/study-page-loading";
import { WeeklyAvailability } from "./WeeklyAvailability";
import { ConfirmAvailabilityModal } from "./ConfirmAvailabilityModal";
import type { Role, SchedulingState, StudyState, WeeklyBlock } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { getAvailabilityData, submitAvailability } from "../api";

export default function AvailabilityContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudyState | null>(null);
  const [schedule, setSchedule] = useState<SchedulingState | null>(null);
  const [blocks, setBlocks] = useState<WeeklyBlock[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [role, setRole] = useState<Role>("student");

  useEffect(() => {
    const requestedRole: Role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getAvailabilityData(requestedRole)
      .then(({ profile: person, schedule: state }) => {
        if (!person.membership || person.membership.status === "onboarding") { router.replace(`/onboarding?role=${requestedRole}`); return; }
        if (person.membership.status === "rejected") { router.replace("/dashboard?role=teacher"); return; }
        if (!state) return;
        setRole(requestedRole); setProfile(person); setSchedule(state); setBlocks(state.availability);
      })
      .catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Unable to load your schedule."); router.replace("/login"); });
  }, [router]);

  async function save() {
    if (!blocks.length) { notifyError("Select at least one 15-minute block.", "Availability required"); return; }
    setBusy(true);
    try {
      await submitAvailability({ role, blocks });
      setConfirmationOpen(false);
      notifySuccess("Availability submitted", "Your weekly times are saved in Jakarta time.");
      router.replace(`/dashboard?role=${role}`);
    } catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to save availability."); }
    finally { setBusy(false); }
  }

  function reviewSubmission() {
    if (!blocks.length) { notifyError("Select at least one 15-minute block.", "Availability required"); return; }
    setConfirmationOpen(true);
  }

  if (!profile || !schedule) return <StudyShell state={profile} role={role}><StudyPageLoading label="Loading availability" /></StudyShell>;
  return <StudyShell state={profile}><Stack gap="lg" p={{ base: "md", sm: "xl" }} maw={1250} w="100%" mx="auto">
    <div><Text size="xs" fw={700} c="yellow.7" tt="uppercase" style={{ letterSpacing: ".14em" }}>PRIVATE CLASS SCHEDULING</Text><Title order={1} mt={5}>When are you available?</Title><Text c="dimmed" mt={6}>Mark every time you can attend or teach. All times are Asia/Jakarta (WIB), Monday to Sunday, 07:00–22:00.</Text></div>
    <Alert color="yellow" radius="md">{role === "teacher" ? "An admin will match your available times with private students after your profile is approved." : "An admin will compare your availability with eligible teachers and confirm the final schedule."}</Alert>
    <StudyPaper p={{ base: "sm", sm: "lg" }}><WeeklyAvailability initial={schedule.availability} onChange={setBlocks} /></StudyPaper>
    <Group justify="space-between"><Text size="sm" c="dimmed">{blocks.length} time block{blocks.length === 1 ? "" : "s"} selected · changes replace your previous availability.</Text><LandingActionButton onClick={reviewSubmission} disabled={busy} rightSection={<IconArrowRight size={17} />}>Submit availability</LandingActionButton></Group>
    <ConfirmAvailabilityModal opened={confirmationOpen} blocks={blocks} busy={busy} onClose={() => setConfirmationOpen(false)} onConfirm={() => void save()} />
  </Stack></StudyShell>;
}
