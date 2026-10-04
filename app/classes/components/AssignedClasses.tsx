import { Card, Group, SimpleGrid, Text, Title } from "@mantine/core";
import { IconCalendarEvent } from "@tabler/icons-react";
import { displayDate } from "../data";
import type { AssignedClassesProps } from "../types";

export function AssignedClasses({ role, classes, subjects }: AssignedClassesProps) {
  return <div>
    <Title order={2} size="h3" mb="sm">{role === "teacher" ? "Assigned classes" : "Your current classes"}</Title>
    {classes.length ? <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>{classes.map((item) => <Card key={item.id} withBorder radius="lg"><Group justify="space-between"><Text fw={700}>{item.code}</Text><IconCalendarEvent size={18} /></Group><Text size="sm" c="dimmed" mt="xs">{item.subject_name ?? subjects.find((subject) => subject.id === item.offering_id)?.name ?? "Subject"} · {item.class_type}</Text><Text size="sm">Starts {displayDate(item.first_date)}</Text></Card>)}</SimpleGrid> : <Card withBorder radius="lg"><Text size="sm" c="dimmed">No classes have been scheduled yet.</Text></Card>}
  </div>;
}
