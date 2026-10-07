"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { notifyError } from "@/lib/feedback";
import { updateTeacherChecklist } from "../api";
import { ChecklistAutosave } from "../checklist-autosave";

// Keep an in-flight save alive when moving to another session within the app.
const queues = new Map<string, ChecklistAutosave>();
let leaveWarningRegistered = false;

export function useChecklistAutosave(userId: string, sessionId: number) {
  const [queue] = useState(() => {
    const key = `${userId}:${sessionId}`;
    let existing = queues.get(key);
    if (!existing) {
      existing = new ChecklistAutosave(
        (changes) => updateTeacherChecklist(sessionId, changes),
        (error) => notifyError(error instanceof Error ? error.message : "Unable to save checklist. Please try again."),
      );
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
