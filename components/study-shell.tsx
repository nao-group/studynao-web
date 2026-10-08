"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell, Avatar, Box, Burger, Group, Menu, ScrollArea, Stack, Text, Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconCalendarEvent, IconChevronDown, IconChevronLeft, IconChevronRight, IconClock, IconLayoutGrid, IconReceipt, IconLogout, IconUser } from "@tabler/icons-react";
import { ColorToggle, ColorToggleMenuItem } from "@/components/color-toggle";
import { StudentNotificationBell } from "./student-notification-bell";
import { logOut } from "@/lib/studynao-api";
import type { StudyState } from "@/lib/types";
import { useAuth } from "@/store/auth";
import styles from "./study-shell.module.css";

type Role = "student" | "teacher";
const HEADER_HEIGHT = 80;

function Logo({ collapsed }: { collapsed: boolean }) {
  const name = collapsed ? "nao_icon" : "study_nao";
  return <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={styles.lightSchemeLogo} src={`/images/logo/${name}_light.png`} alt="StudyNao" width={collapsed ? 36 : 168} style={{ height: collapsed ? 36 : "auto", maxHeight: 46, objectFit: "contain" }} />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={styles.darkSchemeLogo} src={`/images/logo/${name}_dark.png`} alt="" aria-hidden="true" width={collapsed ? 36 : 168} style={{ height: collapsed ? 36 : "auto", maxHeight: 46, objectFit: "contain" }} />
  </>;
}

export function StudyShell({ state, role: requestedRole = "student", children, mainClassName }: { state: StudyState | null; role?: Role; children: React.ReactNode; mainClassName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionUser = useAuth((session) => session.user);
  const role: Role = state?.membership?.role ?? requestedRole;
  const [mobileOpened, setMobileOpened] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const width = collapsed ? 72 : 240;
  const user = state?.user ?? sessionUser;
  const name = user?.full_name || "StudyNao";
  const firstName = name.split(" ")[0];
  const avatar = state?.user.avatar_url || sessionUser?.avatar_url || (role === "teacher" ? String(state?.profile?.photo_url ?? "") : "");
  const nav = [
    { label: "Dashboard", icon: IconLayoutGrid, href: `/dashboard?role=${role}`, path: "/dashboard" },
    { label: role === "teacher" ? "Teaching classes" : "My classes", icon: IconCalendarEvent, href: `/classes?role=${role}`, path: "/classes" },
    { label: "Weekly availability", icon: IconClock, href: `/availability?role=${role}`, path: "/availability" },
    ...(role === "teacher" ? [{ label: "Zoom reimbursements", icon: IconReceipt, href: "/reimbursements?role=teacher", path: "/reimbursements" }] : []),
  ].filter((item) => (state?.membership?.status !== "rejected" || item.path === "/dashboard") && !(role === "student" && state?.membership?.status === "inactive" && item.path === "/availability"));
  const pageLabel = nav.find((item) => (item.path === pathname || pathname.startsWith(`${item.path}/`)))?.label ?? (pathname === "/profile" ? "Profile" : "StudyNao");

  async function logout() {
    try { await logOut(); } catch { /* Local session is still removed. */ }
    useAuth.getState().clear();
    router.replace("/login");
  }
  function go(href: string) { router.push(href); setMobileOpened(false); }

  return <AppShell className={styles.shell} header={{ height: HEADER_HEIGHT }} navbar={{ width, breakpoint: "sm", collapsed: { mobile: !mobileOpened } }} padding={0}>
    <AppShell.Header className={styles.header}><Group h={HEADER_HEIGHT} wrap="nowrap" gap={0}>
      <UnstyledButton visibleFrom="sm" className={styles.logoButton} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} style={{ width, height: "100%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", paddingInline: collapsed ? 0 : rem(20), transition: "width 200ms ease, padding 200ms ease" }}><Logo collapsed={collapsed} /></UnstyledButton>
      <Group hiddenFrom="sm" px="md" gap="sm"><Burger opened={mobileOpened} onClick={() => setMobileOpened((value) => !value)} size="sm" color="#F7FBFC" aria-label="Toggle navigation" /><Logo collapsed={false} /></Group>
      <Group flex={1} px={{ base: "md", sm: "xl" }} justify="space-between" align="center" wrap="nowrap"><Box visibleFrom="sm"><Text className={styles.greeting} c="#F7FBFC">{user ? `Welcome back, ${firstName}!` : "Welcome to StudyNao"}</Text><Text size="sm" c="rgba(226,241,244,.58)">{pageLabel}</Text></Box><Group gap="md" ml="auto" wrap="nowrap">{role === "student" && <StudentNotificationBell />}<ColorToggle className={styles.themeToggle} /><Menu position="bottom-end" shadow="md" width={240} withArrow offset={12}><Menu.Target><UnstyledButton className={styles.accountButton} aria-label={`Open account menu for ${name}`}><Avatar src={avatar || undefined} radius="xl" size={40} color="yellow">{name.slice(0, 1)}</Avatar><Box className={styles.accountDetails}><Text className={styles.accountName} truncate>{name}</Text><Text className={styles.accountEmail} truncate>{user?.email ?? ""}</Text></Box><IconChevronDown className={styles.accountChevron} size={18} aria-hidden="true" /></UnstyledButton></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<IconUser size={17} />} onClick={() => go(`/profile?role=${role}`)}>Profile</Menu.Item><ColorToggleMenuItem /><Menu.Divider /><Menu.Item color="red" leftSection={<IconLogout size={17} />} onClick={() => void logout()}>Sign out</Menu.Item></Menu.Dropdown></Menu></Group></Group>
    </Group></AppShell.Header>
    <AppShell.Navbar className={styles.navbar} style={{ display: "flex", flexDirection: "column" }}><ScrollArea flex={1} px={collapsed ? 0 : "xs"} py="md"><Stack gap={2}>
      {!collapsed && <Text className={styles.sectionLabel} size="xs" tt="uppercase" px={12} mb={4}>STUDYNAO</Text>}
      {nav.map((item) => { const Icon = item.icon; const active = pathname === item.path || pathname.startsWith(`${item.path}/`); const button = <UnstyledButton key={item.path} className={styles.navItem} data-active={active || undefined} data-collapsed={collapsed || undefined} aria-current={active ? "page" : undefined} onClick={() => go(item.href)}><Icon size={18} stroke={1.65} aria-hidden="true" />{!collapsed && <span>{item.label}</span>}</UnstyledButton>; return collapsed ? <Tooltip key={item.path} label={item.label} position="right" withArrow>{button}</Tooltip> : button; })}
    </Stack></ScrollArea><Box className={styles.sidebarFooter} px={collapsed ? rem(8) : "xs"} py="xs"><UnstyledButton className={styles.profileButton} p="xs" aria-label={`Open profile for ${name}`} onClick={() => go(`/profile?role=${role}`)} style={{ width: "100%" }}><Group gap="sm" wrap="nowrap" justify={collapsed ? "center" : "flex-start"}><Avatar src={avatar || undefined} radius="xl" size={28} color="yellow">{name.slice(0, 1)}</Avatar>{!collapsed && <Box style={{ minWidth: 0 }}><Text size="sm" fw={600} c="#F7FBFC" truncate>{name}</Text><Text size="xs" c="rgba(226,241,244,.58)" truncate>{user?.email ?? ""}</Text></Box>}</Group></UnstyledButton><UnstyledButton className={styles.collapseButton} visibleFrom="sm" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-end", width: "100%", height: rem(32), padding: `0 ${rem(4)}`, color: "rgba(226,241,244,.7)" }}>{collapsed ? <IconChevronRight size={15} /> : <Group gap={4}><Text size="xs">Collapse</Text><IconChevronLeft size={15} /></Group>}</UnstyledButton></Box></AppShell.Navbar>
    <AppShell.Main className={[styles.main, mainClassName].filter(Boolean).join(" ")}><Box key={pathname} className={styles.pageTransition}>{children}</Box></AppShell.Main><span className={styles.innerCorner} aria-hidden="true" />
  </AppShell>;
}
