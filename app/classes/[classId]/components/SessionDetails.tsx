"use client";

import { useEffect, useState } from "react";
import { Badge, Checkbox, Group, Loader, Select, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";
import { IconCalendarEvent, IconCheck, IconChecklist, IconClock, IconUsers, IconVideo } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { StudyCard } from "@/components/ui/study-surface";
import { notifyError, notifySuccess } from "@/lib/feedback";
import type { ClassSession, ScheduledClass } from "@/lib/types";
import { getTeacherSession, submitTeachingLog } from "../api";
import type { AttendanceStatus, TeacherChecklist, TeacherSessionDetail } from "../types";
import { jakartaDay, sessionDate, sessionDateTime, sessionTime } from "../data";
import styles from "../class-detail.module.css";
import { useChecklistAutosave } from "./use-checklist-autosave";
import { useAttendanceAutosave } from "./use-attendance-autosave";
import { ZoomAccountDetails } from "./ZoomAccountDetails";

const beforeClass: { key: keyof TeacherChecklist; label: string }[] = [
  { key: "zoom_link_sent", label: "Send the Zoom meeting link" },
  { key: "camera_reminder_sent", label: "Remind students to turn on cameras" },
  { key: "recording_started", label: "Record the class" },
];
const afterClass: { key: keyof TeacherChecklist; label: string }[] = [
  { key: "slides_sent", label: "Send class slides" },
  { key: "homework_sent", label: "Send homework" },
  { key: "recording_uploaded", label: "Upload the recording to Google Drive" },
  { key: "attendance_report_completed", label: "Submit the teaching log and attendance report" },
];
const attendanceOptions = [
  { value: "present", label: "Present" }, { value: "late", label: "Late" },
  { value: "absent", label: "Absent" }, { value: "excused", label: "Excused" },
];

function readDraft(key: string): { report: string; lateReason: string } {
  try {
    const value = typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(key) ?? "null") : null;
    return { report: typeof value?.report === "string" ? value.report : "", lateReason: typeof value?.lateReason === "string" ? value.lateReason : "" };
  } catch { return { report: "", lateReason: "" }; }
}

export function SessionDetails({ session, scheduledClass, teacherView, userId, onSubmitted }: {
  session: ClassSession; scheduledClass: ScheduledClass; teacherView: boolean; userId: string;
  onSubmitted: (sessionId: number, submittedAt: string) => void;
}) {
  const storageKey = `studynao-session-draft:${userId}:${session.id}`;
  const [draft] = useState(() => readDraft(storageKey));
  const [detail, setDetail] = useState<TeacherSessionDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [saving, setSaving] = useState<string | null>(null);
  const [report, setReport] = useState(draft.report);
  const [lateReason, setLateReason] = useState(draft.lateReason);
  const sessionId = session.id;
  const checklist = useChecklistAutosave(userId, sessionId);
  const resetSavedChecklist = checklist.resetSaved;
  const attendance = useAttendanceAutosave(userId, sessionId);
  const resetSavedAttendance = attendance.resetSaved;

  useEffect(() => {
    if (!teacherView) return;
    let current = true;
    getTeacherSession(sessionId).then((value) => {
      if (current) {
        resetSavedChecklist();
        resetSavedAttendance();
        setDetail(value);
        setReport(value.operations?.teaching_log ?? draft.report);
        setLateReason(value.operations?.late_reason ?? draft.lateReason);
        setLoadError(null);
      }
    }).catch((error) => { if (current) setLoadError(error instanceof Error ? error.message : "Unable to load session details."); });
    return () => { current = false; };
  }, [sessionId, teacherView, loadAttempt, draft, resetSavedChecklist, resetSavedAttendance]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!teacherView || !detail || detail.operations?.submitted_at) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ report, lateReason })); } catch { /* The form remains usable without storage. */ }
  }, [report, lateReason, storageKey, teacherView, detail]);

  function toggle(key: keyof TeacherChecklist, checked: boolean) {
    checklist.change(key, checked, !!detail?.operations?.[key]);
  }
  async function submit() {
    if (checklist.pending || attendance.pending || saving) return;
    setSaving("report");
    try {
      const updated = await submitTeachingLog(sessionId, report.trim(), lateReason.trim() || null);
      setDetail(updated);
      if (updated.operations?.submitted_at) onSubmitted(sessionId, updated.operations.submitted_at);
      try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
      notifySuccess("Teaching log submitted", "Your attendance time has been recorded.");
    } catch (error) { notifyError(error instanceof Error ? error.message : "Unable to submit teaching log."); }
    finally { setSaving(null); }
  }
  function markAttendance(studentId: string, status: AttendanceStatus) {
    const previous = detail?.attendance.find((student) => student.student_user_id === studentId)?.status ?? null;
    attendance.change(studentId, status, previous);
  }

  const ended = now >= new Date(session.ends_at).getTime();
  const late = jakartaDay(new Date(now)) > jakartaDay(new Date(session.ends_at));
  const cancelled = session.status === "cancelled" || scheduledClass.status === "cancelled";
  const submitted = !!detail?.operations?.submitted_at || !!session.teaching_log_submitted_at;
  const missingAttendance = !detail?.attendance.length || detail.attendance.some((student) => !(attendance.values[student.student_user_id] ?? student.status));
  const statusLabel = cancelled ? "Cancelled" : submitted ? "Report submitted" : ended ? teacherView ? "Awaiting teaching log" : "Session ended" : "Scheduled";

  return <Stack gap="lg">
    <StudyCard p={{ base: "lg", sm: "xl" }}>
      <Text className={styles.eyebrow}>{scheduledClass.subject_name ?? "Class session"}</Text>
      <Group justify="space-between" align="start" gap="md"><Title order={1} className={styles.title}>Session {session.session_number}</Title><Badge variant="light" color={cancelled ? "red" : submitted ? "teal" : ended ? "yellow" : "blue"}>{statusLabel}</Badge></Group>
      <Text c="dimmed" mt="sm">{scheduledClass.code} · {scheduledClass.class_type === "private" ? "Private" : "Group"} · {scheduledClass.teaching_language}</Text>
      <div className={styles.sessionMeta}><span className={styles.sessionMetaItem}><IconCalendarEvent size={18} aria-hidden="true" />{sessionDate(session.starts_at)}</span><span className={styles.sessionMetaItem}><IconClock size={18} aria-hidden="true" />{sessionTime(session.starts_at)}–{sessionTime(session.ends_at)} WIB</span><span className={styles.sessionMetaItem}><IconUsers size={18} aria-hidden="true" />{scheduledClass.teacher_name || "Teacher to be confirmed"}</span></div>
    </StudyCard>

    {!teacherView && <StudyCard p={{ base: "lg", sm: "xl" }}><Title order={2} size="h3" mb="sm">About this session</Title><Text c="dimmed">{cancelled ? "This session has been cancelled. Check the session list for your other classes." : ended ? "This session has ended. You can review your class information or choose another session from the list." : "Your class takes place at the time shown above. All session times are in Jakarta (WIB)."}</Text><SimpleGrid cols={{ base: 1, sm: 2 }} mt="lg"><div className={styles.infoField}><Text size="sm" c="dimmed">Teacher</Text><Text fw={600} mt={5}>{scheduledClass.teacher_name || "To be confirmed"}</Text></div><div className={styles.infoField}><Text size="sm" c="dimmed">Session duration</Text><Text fw={600} mt={5}>{Math.round((new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime()) / 60000)} minutes</Text></div></SimpleGrid></StudyCard>}

    {teacherView && (loadError ? <StudyCard p="xl"><Text c="red" role="alert">{loadError}</Text><LandingActionButton tone="secondary" mt="md" onClick={() => { setLoadError(null); setLoadAttempt((value) => value + 1); }}>Try again</LandingActionButton></StudyCard> : !detail ? <StudyCard p="xl"><Group><Loader size="sm" /><Text c="dimmed" role="status">Loading session details…</Text></Group></StudyCard> : <>
      <StudyCard p={{ base: "lg", sm: "xl" }}><div className={styles.sectionTitle}><IconVideo size={23} className={styles.sectionIcon} aria-hidden="true" /><Title order={2} size="h3">Zoom account</Title></div>{detail.zoom_account ? <ZoomAccountDetails key={detail.zoom_account.id} account={detail.zoom_account} /> : <Text c="dimmed">No Zoom account assigned. Contact an admin before class.</Text>}</StudyCard>
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
        <StudyCard p={{ base: "lg", sm: "xl" }}><div className={styles.sectionTitle}><IconChecklist size={23} className={styles.sectionIcon} aria-hidden="true" /><Title order={2} size="h3">Before class</Title></div><Stack gap="md" className={styles.checklist}>{beforeClass.map(({ key, label }) => <Checkbox key={key} label={label} checked={checklist.values[key] ?? !!detail.operations?.[key]} disabled={!!saving || cancelled} onChange={(event) => void toggle(key, event.currentTarget.checked)} />)}</Stack><Text size="sm" c="dimmed" mt="lg" role="status" aria-live="polite">{checklist.status === "saving" ? "Saving changes… You can keep checking items." : checklist.status === "saved" ? "All changes saved." : checklist.status === "error" ? "Some changes could not be saved. Please check them again." : "Changes save automatically."}</Text></StudyCard>
        <StudyCard p={{ base: "lg", sm: "xl" }}><div className={styles.sectionTitle}><IconCheck size={23} className={styles.sectionIcon} aria-hidden="true" /><Title order={2} size="h3">After class</Title></div><Stack gap="md" className={styles.checklist}>{afterClass.map(({ key, label }) => <Checkbox key={key} label={label} checked={checklist.values[key] ?? !!detail.operations?.[key]} disabled={!!saving || cancelled || key === "attendance_report_completed"} onChange={(event) => void toggle(key, event.currentTarget.checked)} />)}</Stack><Text size="sm" c="dimmed" mt="lg">The attendance item is checked when you submit the teaching log.</Text></StudyCard>
      </SimpleGrid>
      <StudyCard p={{ base: "lg", sm: "xl" }}><div className={styles.sectionTitle}><IconUsers size={23} className={styles.sectionIcon} aria-hidden="true" /><Title order={2} size="h3">Student attendance</Title></div>{detail.attendance.map((student) => <div key={student.student_user_id} className={styles.attendanceRow}><Text fw={600}>{student.student_name}</Text><Select aria-label={`Attendance for ${student.student_name}`} placeholder="Mark attendance" className={styles.attendanceSelect} data={attendanceOptions} value={attendance.values[student.student_user_id] ?? student.status} disabled={!!saving || cancelled || submitted} onChange={(value) => { if (value) void markAttendance(student.student_user_id, value as AttendanceStatus); }} /></div>)}{!detail.attendance.length && <Text c="dimmed">No students are enrolled in this class.</Text>}<Text size="sm" c="dimmed" mt="md" role="status" aria-live="polite">{attendance.status === "saving" ? "Saving attendance… You can keep marking students." : attendance.status === "saved" ? "All attendance changes saved." : attendance.status === "error" ? "Some attendance changes could not be saved. Please check them again." : "Mark every student before submitting the teaching log. Changes save automatically."}</Text></StudyCard>
      <StudyCard p={{ base: "lg", sm: "xl" }}><Title order={2} size="h3" mb="lg">Teaching log and attendance</Title>{submitted ? <Stack gap="md"><Text className={styles.reportText}>{detail.operations?.teaching_log}</Text><Text size="sm" c="dimmed">Submitted {sessionDateTime(detail.operations?.submitted_at ?? session.teaching_log_submitted_at!)}</Text>{detail.operations?.late_reason && <div className={styles.infoField}><Text size="sm" c="dimmed">Reason for late submission</Text><Text mt={5}>{detail.operations.late_reason}</Text></div>}</Stack> : <form onSubmit={(event) => { event.preventDefault(); void submit(); }}><Stack gap="md"><Textarea label="What was covered in this session?" placeholder="Topics, progress, and notes for the next class" minRows={5} maxLength={10000} value={report} disabled={cancelled || saving === "report"} onChange={(event) => setReport(event.currentTarget.value)} />{late && <Textarea label="Reason for submitting on another day" required minRows={2} maxLength={2000} value={lateReason} disabled={cancelled || saving === "report"} onChange={(event) => setLateReason(event.currentTarget.value)} />}<Text size="sm" c="dimmed">{(checklist.pending || attendance.pending) ? "Saving checklist and attendance changes before submitting the log…" : !ended ? "The log can be submitted after this session ends." : missingAttendance ? "Complete student attendance above to submit this log." : "Your submission time will be recorded as teacher attendance."}</Text><Group justify="flex-end"><LandingActionButton type="submit" disabled={!!saving || checklist.pending || attendance.pending || !ended || cancelled || !report.trim() || missingAttendance || (late && !lateReason.trim())} loading={saving === "report"}>Submit teaching log</LandingActionButton></Group></Stack></form>}</StudyCard>
    </>)}
  </Stack>;
}
