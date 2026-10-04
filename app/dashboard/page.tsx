"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Badge, Button, Center, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { ColorToggle } from "@/components/color-toggle";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { api, type StudyState } from "@/lib/api";
import { notifyError } from "@/lib/feedback";
import { useAuth } from "@/store/auth";

export default function DashboardPage() {
  const router = useRouter(); const [state, setState] = useState<StudyState | null>(null);
  useEffect(() => { const role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student"; api<StudyState>(`/api/studynao/me?role=${role}`).then((value) => { if (!value.membership || value.membership.status === "onboarding") router.replace(`/onboarding?role=${role}`); else setState(value); }).catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Your session has expired."); router.replace("/login"); }); }, [router]);
  async function logout() { try { await api("/api/auth/logout", { method: "POST" }); } catch { /* Local session is still removed. */ } useAuth.getState().clear(); router.replace("/login"); }
  if (!state) return <Center mih="100vh"><Loader aria-label="Loading dashboard" /></Center>;
  const teacher = state.membership?.role === "teacher"; const pending = state.membership?.status === "pending_verification"; const rejected = state.membership?.status === "rejected";
  return <main className="dashboard-shell"><header className="dash-head"><Link className="brand" href="/">Study<span>Nao</span></Link><Group><ColorToggle /><Button variant="subtle" color="gray" onClick={() => void logout()}>Log out</Button></Group></header><Stack gap="xl"><div className="dash-hero"><Text className="eyebrow">{teacher ? "TEACHER PORTAL" : "STUDENT PORTAL"}</Text><Title order={1}>Hello, {state.user.full_name.split(" ")[0]}.</Title><Text>{pending ? "Your profile has been received. An admin is reviewing your teaching access." : rejected ? "Your teacher application was not approved. Review your profile and submit it again." : "Your StudyNao profile has been saved. Your classes and schedule will appear here next."}</Text><Badge mt="lg" color={pending ? "yellow" : rejected ? "red" : "green"}>{pending ? "Awaiting admin approval" : rejected ? "Resubmission required" : "Profile active"}</Badge></div>{rejected ? <Alert color="red" title="Application not approved">You can update your details and apply again.<LandingActionButton tone="secondary" mt="sm" onClick={() => router.push("/onboarding?role=teacher")}>Update profile</LandingActionButton></Alert> : pending ? <Alert color="yellow" title="Teacher verification">You can access your teaching classes once an admin approves your profile.</Alert> : <Alert color="blue" title="What’s next">Class selection, weekly availability, and the timetable will be available in the next scheduling phase.</Alert>}</Stack></main>;
}
