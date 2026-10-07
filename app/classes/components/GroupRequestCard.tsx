"use client";

import { useState } from "react";
import { Badge, Group, SimpleGrid, Text } from "@mantine/core";
import { StudyCard } from "@/components/ui/study-surface";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { displayDate } from "../data";
import type { GroupRequestCardProps } from "../types";
import { WeeklyClassPreview } from "./WeeklyClassPreview";
import { ChooseClassModal } from "./ChooseClassModal";
import type { GroupOption } from "@/lib/types";

export function GroupRequestCard({ request, subject, options, busy, onRefresh, onEnroll }: GroupRequestCardProps) {
  const [selectedClass, setSelectedClass] = useState<GroupOption | null>(null);
  return <><StudyCard p="lg">
    <Group justify="space-between" mb="sm"><div><Text fw={700}>{subject?.name ?? "Group class"}</Text><Text size="sm" c="dimmed">Preferred start: {displayDate(request.preferred_start_date)}</Text></div><Badge color="yellow">Choose a group</Badge></Group>
    <LandingActionButton tone="secondary" onClick={onRefresh}>Refresh available classes</LandingActionButton>
    {options && <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">{options.length ? options.map((option) => <StudyCard key={option.id} p="md"><Group justify="space-between"><Text fw={700}>{option.code}</Text><Badge color={option.seats_available ? "teal" : "red"}>{option.seats_available} seats left</Badge></Group><Text size="sm" mt="xs">Teacher: {option.teacher_name || "To be announced"}</Text><Text size="sm">Starts {displayDate(option.first_date)}</Text><WeeklyClassPreview slots={option.slots} />{option.schedule_conflict && <Text size="sm" c="red" mt="sm">This class overlaps another class on your timetable.</Text>}<LandingActionButton mt="md" disabled={!option.seats_available || option.schedule_conflict || busy} onClick={() => setSelectedClass(option)}>Choose this class</LandingActionButton></StudyCard>) : <Text size="sm" c="dimmed">No matching group classes are available yet. Check back later.</Text>}</SimpleGrid>}
  </StudyCard><ChooseClassModal selectedClass={selectedClass} subjectName={subject?.name} busy={busy} onClose={() => setSelectedClass(null)} onConfirm={() => { if (selectedClass) onEnroll(selectedClass.id); }} /></>;
}
