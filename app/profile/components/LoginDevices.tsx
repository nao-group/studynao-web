"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconDeviceLaptop, IconDeviceMobile, IconRefresh, IconShieldCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { useAuth } from "@/store/auth";
import { fetchLoginDevices, forgetLoginDevice, type LoginDevice } from "../api";
import styles from "./profile.module.css";

const mobile = (value: string) => /android|iphone|ipad|mobile/i.test(value);
function deviceLabel(value: string) {
  if (/iphone/i.test(value)) return "iPhone";
  if (/ipad/i.test(value)) return "iPad";
  if (/android/i.test(value)) return "Android device";
  if (/edg/i.test(value)) return "Microsoft Edge";
  if (/chrome/i.test(value)) return "Google Chrome";
  if (/firefox/i.test(value)) return "Mozilla Firefox";
  if (/safari/i.test(value)) return "Safari";
  return value === "Unknown Device" ? "Unknown device" : "Web browser";
}
function details(value: string) {
  return /windows/i.test(value) ? "Windows" : /mac os|macintosh/i.test(value) ? "macOS" : /android/i.test(value) ? "Android" : /iphone|ipad/i.test(value) ? "iOS" : "Device details unavailable";
}
function activity(value: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Activity time unavailable";
  return `Last active ${new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`;
}

export function LoginDevices() {
  const router = useRouter();
  const [devices, setDevices] = useState<LoginDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LoginDevice | null>(null);
  const [revoking, setRevoking] = useState(false);
  useEffect(() => { let active = true; fetchLoginDevices().then((items) => { if (active) setDevices(items); }).catch((error) => { if (active) notifyError(error instanceof Error ? error.message : "Unable to load devices."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function refresh() { setLoading(true); try { setDevices(await fetchLoginDevices()); } catch (error) { notifyError(error instanceof Error ? error.message : "Unable to load devices."); } finally { setLoading(false); } }
  async function revoke() {
    if (!selected) return;
    setRevoking(true);
    try {
      await forgetLoginDevice(selected.session_id);
      if (selected.is_current) { useAuth.getState().clear(); router.replace("/login"); return; }
      setDevices((items) => items.filter((item) => item.session_id !== selected.session_id));
      setSelected(null);
      notifySuccess("Device forgotten", "That device has been signed out.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "Unable to sign out device."); }
    finally { setRevoking(false); }
  }
  return <><StudyCard p={{ base: "lg", sm: "xl" }}><Stack gap="lg">
    <Group justify="space-between" align="start"><Group gap="sm"><IconShieldCheck size={23} color="#d4a017" /><div><Title order={2} size="h3">Login devices</Title><Text size="sm" c="dimmed">Manage browsers and devices signed in to your account.</Text></div></Group><LandingActionButton tone="secondary" size="xs" onClick={() => void refresh()} loading={loading} leftSection={<IconRefresh size={15} />}>Refresh</LandingActionButton></Group>
    {loading ? <Stack gap="sm"><Skeleton height={80} radius="lg" /><Skeleton height={80} radius="lg" /></Stack> : devices.length === 0 ? <Text className={styles.emptyDevices}>No active devices found.</Text> : <Stack gap="sm">{devices.map((device) => { const Icon = mobile(device.device) ? IconDeviceMobile : IconDeviceLaptop; return <Group key={device.session_id} className={styles.device} data-current={device.is_current || undefined} justify="space-between" gap="md" wrap="wrap"><Group gap="md" wrap="nowrap"><Box className={styles.deviceIcon}><Icon size={22} /></Box><div><Group gap="xs"><Text fw={700}>{deviceLabel(device.device)}</Text>{device.is_current && <Badge color="yellow" variant="light">This device</Badge>}</Group><Text size="xs" c="dimmed">{details(device.device)} · {activity(device.last_active_at)}</Text></div></Group><LandingActionButton tone="secondary" size="xs" onClick={() => setSelected(device)}>{device.is_current ? "Log out" : "Forget"}</LandingActionButton></Group>; })}</Stack>}
  </Stack></StudyCard><Modal opened={Boolean(selected)} onClose={() => !revoking && setSelected(null)} title={selected?.is_current ? "Log out this device?" : "Forget this device?"} centered radius="lg"><Stack><Text size="sm">{selected?.is_current ? "You will be signed out of StudyNao on this device." : "This device will be signed out and must log in again to access StudyNao."}</Text><Group justify="flex-end"><LandingActionButton tone="secondary" onClick={() => setSelected(null)} disabled={revoking}>Cancel</LandingActionButton><LandingActionButton onClick={() => void revoke()} loading={revoking}>{selected?.is_current ? "Log out" : "Forget device"}</LandingActionButton></Group></Stack></Modal></>;
}
