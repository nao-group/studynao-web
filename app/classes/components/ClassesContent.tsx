"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader, Stack, Text, Title } from "@mantine/core";
import { StudyShell } from "@/components/study-shell";
import { AssignedClasses } from "./AssignedClasses";
import { ClassRequestForm } from "./ClassRequestForm";
import { GroupRequestCard } from "./GroupRequestCard";
import { needsPrivateAvailability } from "@/lib/scheduling";
import { getSchedulingState } from "@/lib/studynao-api";
import type { GroupOption, Program, Role, SchedulingState, StudyState, Subject } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/feedback";
import { createClassRequests, enrollInGroup, getClassesData, getGroupOptions } from "../api";

export default function ClassesContent() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [profile, setProfile] = useState<StudyState | null>(null);
  const [schedule, setSchedule] = useState<SchedulingState | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [firstDate, setFirstDate] = useState("");
  const [options, setOptions] = useState<Record<number, GroupOption[]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const requestedRole: Role = new URLSearchParams(window.location.search).get("role") === "teacher" ? "teacher" : "student";
    getClassesData(requestedRole)
      .then(({ profile: person, schedule: state, catalog }) => {
        if (!person.membership || person.membership.status === "onboarding") {
          router.replace(`/onboarding?role=${requestedRole}`);
          return;
        }
        if (person.membership.status === "rejected") {
          router.replace("/dashboard?role=teacher");
          return;
        }
        if (!state || !catalog) return;
        if (needsPrivateAvailability(person, state)) {
          router.replace(`/availability?role=${requestedRole}`);
          return;
        }
        setRole(requestedRole);
        setProfile(person);
        setSchedule(state);
        setPrograms(catalog.items);
        setSubjects(catalog.subjects);
        if (requestedRole === "student") {
          for (const request of state.requests) {
            const groupRequest = catalog.items.some((program) => program.id === request.program_id && program.class_type === "group");
            if (request.status === "pending" && groupRequest) void loadOptions(request.id);
          }
        }
      })
      .catch((cause) => { notifyError(cause instanceof Error ? cause.message : "Unable to load classes."); router.replace("/login"); });
  }, [router]);

  const selected = useMemo(() => programs.find((item) => String(item.id) === programId), [programId, programs]);
  const pendingGroups = schedule?.requests.filter((request) => request.status === "pending" && programs.some((program) => program.id === request.program_id && program.class_type === "group")) ?? [];

  async function requestClasses() {
    if (!selected || !subjectIds.length || !firstDate) { notifyError("Choose a program, subjects, and first class date."); return; }
    setBusy(true);
    try {
      const created = await createClassRequests({ program_id: selected.id, subject_ids: subjectIds.map(Number), preferred_start_date: firstDate });
      notifySuccess("Class request submitted", selected.class_type === "private" ? "Next, share your weekly availability." : "Choose an available group class below.");
      setSchedule(await getSchedulingState("student"));
      setSubjectIds([]);
      if (selected.class_type === "private") {
        router.push("/availability?role=student");
      } else {
        for (const request of created.items) void loadOptions(request.id);
      }
    } catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to submit your request."); }
    finally { setBusy(false); }
  }
  async function loadOptions(requestId: number) {
    try { const result = await getGroupOptions(requestId); setOptions((current) => ({ ...current, [requestId]: result.items })); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to load group classes."); }
  }
  async function enroll(requestId: number, classId: number) {
    setBusy(true);
    try { await enrollInGroup(requestId, classId); setSchedule(await getSchedulingState("student")); notifySuccess("Class selected", "Your timetable has been updated."); }
    catch (cause) { notifyError(cause instanceof Error ? cause.message : "Unable to join this class."); }
    finally { setBusy(false); }
  }

  if (!profile || !schedule) return <Center mih="100vh"><Loader aria-label="Loading classes" /></Center>;
  return <StudyShell state={profile}>
    <Stack gap="lg" p={{ base: "md", sm: "xl" }} maw={1200} w="100%" mx="auto">
      <div>
        <Text size="xs" fw={700} c="yellow.7" tt="uppercase" style={{ letterSpacing: ".14em" }}>STUDYNAO CLASSES</Text>
        <Title order={1} mt={5}>{role === "teacher" ? "Your teaching classes" : "Choose your classes"}</Title>
        <Text c="dimmed" mt={6}>{role === "teacher" ? "Classes assigned by the admin will appear here." : "You can take more than one subject. Each subject creates its own class request."}</Text>
      </div>
      {role === "student" && <ClassRequestForm
        programs={programs} subjects={subjects} selectedProgram={selected} programId={programId} subjectIds={subjectIds} firstDate={firstDate} busy={busy}
        onProgramChange={(value) => { setProgramId(value); setSubjectIds([]); }} onSubjectsChange={setSubjectIds} onFirstDateChange={setFirstDate}
        onSubmit={() => void requestClasses()}
      />}
      {role === "student" && pendingGroups.map((request) => <GroupRequestCard
        key={request.id} request={request} subject={subjects.find((item) => item.id === request.offering_id)} options={options[request.id]} busy={busy}
        onRefresh={() => void loadOptions(request.id)} onEnroll={(classId) => void enroll(request.id, classId)}
      />)}
      <AssignedClasses role={role} classes={schedule.classes} subjects={subjects} />
    </Stack>
  </StudyShell>;
}
