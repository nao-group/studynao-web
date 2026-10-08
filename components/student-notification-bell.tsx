"use client";
import { useEffect, useState } from "react";
import { ActionIcon, Indicator, Menu, Text } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
type Notice = { id: string; last_session_ends_at: string; created_at: string };
export function StudentNotificationBell() {
 const router = useRouter();
 const [items,setItems] = useState<Notice[]>([]);
 useEffect(() => {
  let active=true;
  const load = async () => { try {const data=await api<{items:Notice[]}>("/api/studynao/student/notifications");if(active)setItems(data.items);} catch { /* Retry when visible again. */ } };
  const refresh=() => {if(document.visibilityState === "visible")void load();};
  void load(); const timer=window.setInterval(refresh,60000);
  window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",refresh);
  return () => {active=false;window.clearInterval(timer);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh);};
 },[]);
 return <Menu position="bottom-end" width={320} withinPortal><Menu.Target><Indicator disabled={!items.length} color="yellow" size={10}><ActionIcon radius="xl" variant="subtle" color="yellow" size="lg" aria-label="StudyNao notifications"><IconBell size={20} /></ActionIcon></Indicator></Menu.Target><Menu.Dropdown><Menu.Label>Notifications</Menu.Label>{items.length ? items.map(item => <Menu.Item key={item.id} onClick={() => { window.dispatchEvent(new Event("studynao-notifications-opened")); router.push("/dashboard?role=student"); }}><Text fw={600} size="sm">Your StudyNao programs are complete</Text><Text size="xs" c="dimmed">Your student status changed to inactive. Last session: {new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",dateStyle:"medium",timeStyle:"short"}).format(new Date(item.last_session_ends_at))} WIB.</Text></Menu.Item>) : <Text size="sm" c="dimmed" p="sm">No notifications yet.</Text>}</Menu.Dropdown></Menu>;
}
