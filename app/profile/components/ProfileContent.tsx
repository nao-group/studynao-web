"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Card, Center, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { StudyShell } from "@/components/study-shell";
import type { StudyState } from "@/lib/types";
import { notifyError } from "@/lib/feedback";
import { getProfile } from "../api";
import type { ProfileFieldProps } from "../types";

function Field({ label, value }: ProfileFieldProps) { return <div><Text size="xs" c="dimmed">{label}</Text><Text fw={600}>{value || "—"}</Text></div>; }

export default function ProfileContent() {
  const router = useRouter();
  const [state, setState] = useState<StudyState | null>(null);
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getProfile(role)
      .then((result) => { if (!result.membership || result.membership.status === "onboarding") router.replace(`/onboarding?role=${role}`); else setState(result); })
      .catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Unable to load profile."); router.replace("/login"); });
  }, [router]);
  if (!state) return <Center mih="100vh"><Loader aria-label="Loading profile" /></Center>;
  const teacher = state.membership?.role === "teacher";
  const profile = state.profile;
  const list = (value: unknown) => Array.isArray(value) ? value.join(", ") : "";
  return <StudyShell state={state}><Stack p={{ base: "md", sm: "xl" }} maw={900} w="100%" mx="auto"><Title order={1}>Your profile</Title><Card withBorder radius="lg" p="xl"><Stack gap="lg"><Avatar src={teacher ? String(profile?.photo_url ?? "") : undefined} size={86} radius="xl" color="yellow">{state.user.full_name.slice(0, 1)}</Avatar><div><Title order={2} size="h3">{state.user.full_name}</Title><Badge mt="xs" color={state.membership?.status === "active" ? "teal" : "yellow"}>{state.membership?.status}</Badge></div><SimpleGrid cols={{ base: 1, sm: 2 }}><Field label="Email" value={state.user.email} /><Field label="WhatsApp" value={String(profile?.whatsapp ?? "")} />{teacher ? <><Field label="Home province" value={String(profile?.province ?? "")} /><Field label="Class types" value={list(profile?.class_types)} /><Field label="Teaching languages" value={list(profile?.teaching_languages)} /><Field label="Bank" value={String(profile?.bank_name ?? "")} /></> : <><Field label="Study level" value={String(profile?.study_level ?? "")} /><Field label="Parent email" value={String(profile?.parent_email ?? "")} /></>}</SimpleGrid></Stack></Card></Stack></StudyShell>;
}
