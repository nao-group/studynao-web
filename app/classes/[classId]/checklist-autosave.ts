import type { TeacherChecklist } from "./types";

type Changes<Key extends string, Value> = Partial<Record<Key, Value>>;
type Snapshot<Key extends string, Value> = { values: Changes<Key, Value>; pending: boolean; status: "idle" | "saving" | "saved" | "error" };
type Save<Key extends string, Value> = (changes: Changes<Key, Value>) => Promise<Changes<Key, Value>>;

// Requests are serialized; clicks during a request form the next batch.
export class FieldAutosave<Key extends string, Value> {
  private confirmed: Changes<Key, Value> = {};
  private queued: Changes<Key, Value> = {};
  private running = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private listeners = new Set<() => void>();
  private snapshot: Snapshot<Key, Value> = { values: {}, pending: false, status: "idle" };

  constructor(private save: Save<Key, Value>, private onError: (error: unknown) => void, private delay = 350) {}

  getSnapshot = () => this.snapshot;
  resetSaved = () => {
    if (this.snapshot.pending) return;
    this.confirmed = {};
    this.publish({}, false, "idle");
  };
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private publish(values: Changes<Key, Value>, pending: boolean, status: Snapshot<Key, Value>["status"]) {
    this.snapshot = { values, pending, status };
    this.listeners.forEach((listener) => listener());
  }

  change(key: Key, value: Value, previous: Value) {
    if (this.confirmed[key] === undefined) this.confirmed[key] = previous;
    this.queued[key] = value;
    this.publish({ ...this.snapshot.values, [key]: value }, true, "saving");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.delay);
  }

  async flush() {
    clearTimeout(this.timer);
    if (this.running || !Object.keys(this.queued).length) return;
    this.running = true;
    let failed = false;
    while (Object.keys(this.queued).length) {
      const batch = this.queued;
      this.queued = {};
      try {
        const saved = await this.save(batch);
        if (Object.keys(saved).length !== Object.keys(batch).length) failed = true;
        Object.assign(this.confirmed, saved);
      } catch (error) {
        failed = true;
        this.onError(error);
      }
      // Roll back failed changes only; retain any newer clicks still queued.
      this.publish({ ...this.confirmed, ...this.queued }, true, "saving");
    }
    this.running = false;
    this.publish({ ...this.confirmed }, false, failed ? "error" : "saved");
  }
}

export class ChecklistAutosave extends FieldAutosave<keyof TeacherChecklist, boolean> {
  constructor(save: (changes: Partial<TeacherChecklist>) => Promise<unknown>, onError: (error: unknown) => void, delay = 350) {
    super(async (changes) => { await save(changes); return changes; }, onError, delay);
  }
}
