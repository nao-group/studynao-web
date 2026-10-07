"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { notifyError } from "@/lib/feedback";
import { updateStudentAttendance } from "../api";
import { FieldAutosave } from "../checklist-autosave";
import type { AttendanceStatus } from "../types";

const queues = new Map<string, FieldAutosave<string, AttendanceStatus | null>>();
let leaveWarningRegistered = false;

export function useAttendanceAutosave(userId: string, sessionId: number) {
  const [queue] = useState(() => {
    const key = `${userId}:${sessionId}`;
    let existing = queues.get(key);
    if (!existing) {
      existing = new FieldAutosave<string, AttendanceStatus | null>(async (changes) => {
        const saved: Record<string, AttendanceStatus> = {};
        const results = await Promise.allSettled(Object.entries(changes).map(async ([studentId, status]) => {
          if (!status) throw new Error("Choose an attendance status.");
          await updateStudentAttendance(sessionId, studentId, status);
          saved[studentId] = status;
        }));
        const failures = results.filter((result) => result.status === "rejected");
        if (failures.length) notifyError("Some attendance changes could not be saved. Their previous values have been restored. Please try again.");
        return saved;
      }, (error) => notifyError(error instanceof Error ? error.message : "Unable to save attendance. Please try again."));
      queues.set(key, existing);
    }
    return existing;
  });
  const snapshot = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);

  useEffect(() => {
    if (!leaveWarningRegistered) {
      window.addEventListener("beforeunload", (event) => {
        if (![...queues.values()].some((item) => item.getSnapshot().pending)) return;
        event.preventDefault();
        event.returnValue = "";
      });
      leaveWarningRegistered = true;
    }
    return () => { void queue.flush(); };
  }, [queue]);

  return { ...snapshot, change: queue.change.bind(queue), resetSaved: queue.resetSaved };
}
