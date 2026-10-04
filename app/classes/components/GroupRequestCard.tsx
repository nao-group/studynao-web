import { Badge, Button, Card, Group, SimpleGrid, Text } from "@mantine/core";
import { displayDate } from "../data";
import type { GroupRequestCardProps } from "../types";
import { WeeklyClassPreview } from "./WeeklyClassPreview";

export function GroupRequestCard({ request, subject, options, busy, onRefresh, onEnroll }: GroupRequestCardProps) {
  return <Card withBorder radius="lg" p="lg">
    <Group justify="space-between" mb="sm"><div><Text fw={700}>{subject?.name ?? "Group class"}</Text><Text size="sm" c="dimmed">Preferred start: {displayDate(request.preferred_start_date)}</Text></div><Badge color="yellow">Choose a group</Badge></Group>
    <Button variant="light" onClick={onRefresh}>Refresh available classes</Button>
    {options && <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">{options.length ? options.map((option) => <Card key={option.id} withBorder radius="md"><Group justify="space-between"><Text fw={700}>{option.code}</Text><Badge color={option.seats_available ? "teal" : "red"}>{option.seats_available} seats left</Badge></Group><Text size="sm" mt="xs">Teacher: {option.teacher_name || "To be announced"}</Text><Text size="sm">Starts {displayDate(option.first_date)}</Text><WeeklyClassPreview slots={option.slots} /><Button mt="md" disabled={!option.seats_available} loading={busy} onClick={() => onEnroll(option.id)}>Choose this class</Button></Card>) : <Text size="sm" c="dimmed">No matching group classes are available yet. Check back later.</Text>}</SimpleGrid>}
  </Card>;
}
