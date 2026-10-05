"use client";

import { useState } from "react";
import { Group, MultiSelect, Select, SimpleGrid, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { StudyCard } from "@/components/ui/study-surface";
import { notifyError } from "@/lib/feedback";
import type { ClassRequestFormProps } from "../types";
import { RequestClassModal } from "./RequestClassModal";

export function ClassRequestForm(props: ClassRequestFormProps) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const selectedSubjects = props.subjects.filter((subject) => props.subjectIds.includes(String(subject.id)));

  function reviewRequest() {
    if (!props.selectedProgram || !props.firstDate || selectedSubjects.length === 0) {
      notifyError("Choose a program, subjects, and first class date.");
      return;
    }
    setConfirmationOpen(true);
  }

  async function confirmRequest() {
    if (await props.onSubmit()) setConfirmationOpen(false);
  }

  return <><StudyCard p="lg">
    <Title order={2} size="h3" mb="md">Request a class</Title>
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <Select label="Class package" searchable placeholder="Choose private or group program" data={props.programs.map((item) => ({ value: String(item.id), label: `${item.class_type === "private" ? "Private" : "Group"} · ${item.subject} · ${item.teaching_language} · ${item.session_count} sessions` }))} value={props.programId} onChange={props.onProgramChange} required />
      <DatePickerInput label="Preferred first class date" placeholder="Choose a date" valueFormat="DD MMMM YYYY" value={props.firstDate || null} onChange={(value) => props.onFirstDateChange(value ?? "")} minDate={new Date()} required />
    </SimpleGrid>
    <MultiSelect mt="md" label="Subjects" placeholder="Select one or more subjects" disabled={!props.selectedProgram} data={props.subjects.filter((subject) => props.selectedProgram?.subject_ids.includes(subject.id)).map((subject) => ({ value: String(subject.id), label: subject.name }))} value={props.subjectIds} onChange={props.onSubjectsChange} required />
    <Group justify="flex-end" mt="lg"><LandingActionButton disabled={props.busy} onClick={reviewRequest} rightSection={<IconArrowRight size={16} />}>Continue</LandingActionButton></Group>
  </StudyCard><RequestClassModal
    opened={confirmationOpen}
    program={props.selectedProgram}
    subjects={selectedSubjects}
    firstDate={props.firstDate}
    busy={props.busy}
    onClose={() => setConfirmationOpen(false)}
    onConfirm={() => void confirmRequest()}
  /></>;
}
