import { Button, Card, Group, MultiSelect, Select, SimpleGrid, TextInput, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import type { ClassRequestFormProps } from "../types";

export function ClassRequestForm(props: ClassRequestFormProps) {
  return <Card withBorder radius="lg" p="lg">
    <Title order={2} size="h3" mb="md">Request a class</Title>
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <Select label="Class package" searchable placeholder="Choose private or group program" data={props.programs.map((item) => ({ value: String(item.id), label: `${item.class_type === "private" ? "Private" : "Group"} · ${item.subject} · ${item.teaching_language} · ${item.session_count} sessions` }))} value={props.programId} onChange={props.onProgramChange} required />
      <TextInput label="Preferred first class date" type="date" value={props.firstDate} onChange={(event) => props.onFirstDateChange(event.currentTarget.value)} required />
    </SimpleGrid>
    <MultiSelect mt="md" label="Subjects" placeholder="Select one or more subjects" disabled={!props.selectedProgram} data={props.subjects.filter((subject) => props.selectedProgram?.subject_ids.includes(subject.id)).map((subject) => ({ value: String(subject.id), label: subject.name }))} value={props.subjectIds} onChange={props.onSubjectsChange} required />
    <Group justify="flex-end" mt="lg"><Button loading={props.busy} onClick={props.onSubmit} rightSection={<IconArrowRight size={16} />}>Continue</Button></Group>
  </Card>;
}
