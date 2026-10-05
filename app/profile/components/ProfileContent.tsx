"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Group, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import { StudyShell } from "@/components/study-shell";
import { StudyPageLoading } from "@/components/study-page-loading";
import { StudyCard } from "@/components/ui/study-surface";
import type { Role, StudyState } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { useAuth } from "@/store/auth";
import { getProfile, uploadAvatar } from "../api";
import type { ProfileFieldProps } from "../types";
import { ImageCropModal } from "./ImageCropModal";
import { ChangePassword } from "./ChangePassword";
import { LoginDevices } from "./LoginDevices";
import styles from "./profile.module.css";

function Field({ label, value }: ProfileFieldProps) { return <div><Text size="xs" c="dimmed">{label}</Text><Text fw={600}>{value || "—"}</Text></div>; }

export default function ProfileContent() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<StudyState | null>(null);
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const role: Role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getProfile(role)
      .then((result) => { if (!result.membership || result.membership.status === "onboarding") router.replace(`/onboarding?role=${role}`); else setState(result); })
      .catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Unable to load profile."); router.replace("/login"); });
  }, [router]);
  useEffect(() => () => { if (source) URL.revokeObjectURL(source); }, [source]);
  function choosePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return notifyError("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return notifyError("Please choose an image smaller than 10 MB.");
    setSource(URL.createObjectURL(file));
  }
  async function savePhoto(blob: Blob) {
    setSaving(true);
    try {
      const result = await uploadAvatar(blob);
      setState((current) => current ? { ...current, user: { ...current.user, avatar_url: result.avatar_url } } : current);
      useAuth.getState().setAvatar(result.avatar_url);
      setSource("");
      notifySuccess("Profile picture updated", "Your new photo is visible across StudyNao.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "Unable to update profile picture."); }
    finally { setSaving(false); }
  }
  if (!state) return <StudyShell state={null}><StudyPageLoading label="Loading profile" /></StudyShell>;
  const teacher = state.membership?.role === "teacher";
  const profile = state.profile;
  const list = (value: unknown) => Array.isArray(value) ? value.join(", ") : "";
  const avatar = state.user.avatar_url || (teacher ? String(profile?.photo_url ?? "") : "");
  return <StudyShell state={state}><Stack p={{ base: "md", sm: "xl" }} maw={900} w="100%" mx="auto" gap="lg"><Title order={1}>Your profile</Title><StudyCard p={{ base: "lg", sm: "xl" }}><Stack gap="lg"><Group gap="lg" align="center"><UnstyledButton className={styles.avatarButton} aria-label="Change profile picture" onClick={() => input.current?.click()}><Avatar src={avatar || undefined} size={96} radius="xl" color="yellow">{state.user.full_name.slice(0, 1)}</Avatar><span className={styles.camera}><IconCamera size={17} /></span></UnstyledButton><div><Title order={2} size="h3">{state.user.full_name}</Title><Badge mt="xs" color={state.membership?.status === "active" ? "teal" : "yellow"}>{state.membership?.status}</Badge><Text size="xs" c="dimmed" mt="xs">Click your photo to change it</Text></div></Group><input ref={input} type="file" accept="image/*" hidden onChange={(event) => { choosePhoto(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /><SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg"><Field label="Email" value={state.user.email} /><Field label="WhatsApp" value={String(profile?.whatsapp ?? "")} />{teacher ? <><Field label="Home province" value={String(profile?.province ?? "")} /><Field label="Class types" value={list(profile?.class_types)} /><Field label="Teaching languages" value={list(profile?.teaching_languages)} /><Field label="Bank" value={String(profile?.bank_name ?? "")} /></> : <><Field label="Study level" value={String(profile?.study_level ?? "")} /><Field label="Parent email" value={String(profile?.parent_email ?? "")} /></>}</SimpleGrid></Stack></StudyCard><ChangePassword /><LoginDevices /><ImageCropModal opened={Boolean(source)} source={source} saving={saving} onClose={() => setSource("")} onSave={(blob) => void savePhoto(blob)} /></Stack></StudyShell>;
}
