"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Badge, Group, SegmentedControl, Select, Stack, Text, TextInput } from "@mantine/core";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { StudyCard } from "@/components/ui/study-surface";
import type { ScheduledClass, ClassSession } from "@/lib/types";
import styles from "./schedule-calendar.module.css";

type View = "day" | "week" | "month";
const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateKey = (instant: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};
const utc = (key: string) => new Date(`${key}T00:00:00Z`);
const addDays = (key: string, count: number) => { const date = utc(key); date.setUTCDate(date.getUTCDate() + count); return date.toISOString().slice(0, 10); };
const monday = (key: string) => addDays(key, -((utc(key).getUTCDay() + 6) % 7));
const formatDate = (key: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) => new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(utc(key));
const formatTime = (instant: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(instant));
const minuteOfDay = (instant: string) => { const [hour, minute] = formatTime(instant).split(":").map(Number); return hour * 60 + minute; };

export function ScheduleCalendar({ classes, sessions, teacherView }: { classes: ScheduledClass[]; sessions: ClassSession[]; teacherView: boolean }) {
  const [view, setView] = useState<View>("week");
  const [day, setDay] = useState(() => dateKey(new Date()));
  const [subject, setSubject] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const classMap = useMemo(() => new Map(classes.map((item) => [item.id, item])), [classes]);
  const subjectOptions = [...new Set(classes.map((item) => item.subject_name ?? "Subject"))];
  const filtered = sessions.filter((session) => {
    const item = classMap.get(session.class_id);
    if (!item || (subject && item.subject_name !== subject)) return false;
    const haystack = `${item.code} ${item.teacher_name ?? ""} ${item.student_names?.join(" ") ?? ""} ${item.subject_name ?? ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const weekStart = monday(day);
  const monthStart = `${day.slice(0, 7)}-01`;
  const monthGridStart = monday(monthStart);
  const dates = view === "day" ? [day] : Array.from({ length: view === "week" ? 7 : 42 }, (_, index) => addDays(view === "week" ? weekStart : monthGridStart, index));
  const byDate = new Map<string, ClassSession[]>();
  for (const session of filtered) {
    const key = dateKey(new Date(session.starts_at));
    byDate.set(key, [...(byDate.get(key) ?? []), session]);
  }
  const title = view === "month" ? formatDate(monthStart, { month: "long", year: "numeric" }) : view === "week" ? `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6), { day: "numeric", month: "short", year: "numeric" })}` : formatDate(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  function shift(direction: number) {
    if (view === "month") { const date = utc(monthStart); date.setUTCMonth(date.getUTCMonth() + direction); setDay(date.toISOString().slice(0, 10)); }
    else setDay(addDays(day, direction * (view === "week" ? 7 : 1)));
  }

  return <StudyCard p={{ base: "sm", sm: "lg" }}>
    <Group justify="space-between" mb="md" gap="sm"><Group gap="xs"><ActionIcon variant="subtle" radius="xl" aria-label="Previous period" onClick={() => shift(-1)}><IconChevronLeft size={17} /></ActionIcon><ActionIcon variant="subtle" radius="xl" aria-label="Next period" onClick={() => shift(1)}><IconChevronRight size={17} /></ActionIcon><LandingActionButton tone="secondary" size="xs" onClick={() => setDay(dateKey(new Date()))}>Today</LandingActionButton><Text fw={700}>{title}</Text></Group><SegmentedControl value={view} onChange={(value) => setView(value as View)} data={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]} /></Group>
    <Group mb="md" align="end"><Select label="Subject" placeholder="All subjects" clearable data={subjectOptions} value={subject} onChange={setSubject} w={200} /><TextInput label={teacherView ? "Search student or class code" : "Search teacher or class code"} leftSection={<IconSearch size={15} />} value={query} onChange={(event) => setQuery(event.currentTarget.value)} flex={1} miw={220} /></Group>
    <div className={styles.scroll}>{view === "month" ? <div className={styles.month}>
      {dates.map((date, index) => <div key={date} className={styles.date} data-today={date === dateKey(new Date()) || undefined} data-outside={!date.startsWith(day.slice(0, 7)) || undefined}>
        <Text className={styles.dateHead} size="sm" fw={700}>{weekday[index % 7]} {formatDate(date, { day: "numeric" })}</Text>
        <Stack gap={5}>{(byDate.get(date) ?? []).map((session) => { const item = classMap.get(session.class_id)!; return <div key={session.id} className={styles.event}><Text fw={700} size="xs">{formatTime(session.starts_at)} · {item.subject_name ?? "Class"}</Text><Text size="xs" truncate>{item.code}</Text></div>; })}</Stack>
      </div>)}
    </div> : <div className={styles.timeline} data-view={view}><div className={styles.timeColumn}><div className={styles.timeHeader} />{Array.from({ length: 16 }, (_, index) => <span key={index} style={{ top: 38 + index * 48 }}>{String(index + 7).padStart(2, "0")}:00</span>)}</div>{dates.map((date) => <div key={date} className={styles.timelineDay} data-today={date === dateKey(new Date()) || undefined}><Text className={styles.timelineHead} size="sm" fw={700}>{formatDate(date, { weekday: "short", day: "numeric", month: "short" })}</Text><div className={styles.timeBody}>{(byDate.get(date) ?? []).map((session) => { const item = classMap.get(session.class_id)!; const start = minuteOfDay(session.starts_at); const end = minuteOfDay(session.ends_at); return <div key={session.id} className={styles.timedEvent} style={{ top: (start - 420) * .8, height: Math.max(28, (end - start) * .8) }}><Text fw={700} size="xs">{formatTime(session.starts_at)}–{formatTime(session.ends_at)} · {item.subject_name ?? "Class"}</Text><Text size="xs" truncate>{item.code} · {teacherView ? item.student_names?.join(", ") || "Student" : item.teacher_name}</Text></div>; })}</div></div>)}</div>}</div>
    {!filtered.length && <Group justify="center" py="xl"><Badge color="gray" variant="light">No scheduled sessions yet</Badge></Group>}
  </StudyCard>;
}
