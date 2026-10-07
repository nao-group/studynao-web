import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/classes/[classId]/checklist-autosave.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { ChecklistAutosave, FieldAutosave } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("updates immediately and batches rapid clicks", async () => {
  const requests = [];
  const queue = new ChecklistAutosave(async (changes) => requests.push(changes), assert.fail, 1000);
  queue.change("zoom_link_sent", true, false);
  queue.change("recording_started", true, false);
  queue.change("zoom_link_sent", false, false);
  assert.equal(requests.length, 0);
  assert.equal(queue.getSnapshot().values.recording_started, true);
  assert.equal(queue.getSnapshot().values.zoom_link_sent, false);
  assert.equal(queue.getSnapshot().pending, true);
  await queue.flush();
  assert.deepEqual(requests, [{ zoom_link_sent: false, recording_started: true }]);
  assert.equal(queue.getSnapshot().status, "saved");
});

test("serializes slow requests and keeps the latest click visible", async () => {
  const first = deferred();
  const second = deferred();
  const requests = [];
  const queue = new ChecklistAutosave((changes) => {
    requests.push(changes);
    return requests.length === 1 ? first.promise : second.promise;
  }, assert.fail, 1000);
  queue.change("slides_sent", true, false);
  const saving = queue.flush();
  queue.change("slides_sent", false, false);
  queue.change("homework_sent", true, false);
  await queue.flush();
  assert.equal(requests.length, 1);
  first.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(queue.getSnapshot().values.slides_sent, false);
  assert.deepEqual(requests[1], { slides_sent: false, homework_sent: true });
  second.resolve();
  await saving;
  assert.equal(queue.getSnapshot().values.homework_sent, true);
  assert.equal(queue.getSnapshot().pending, false);
});

test("attendance restores only failed students and retains successful saves", async () => {
  const queue = new FieldAutosave(async () => ({ studentA: "present" }), assert.fail, 1000);
  queue.change("studentA", "present", null);
  queue.change("studentB", "late", "absent");
  assert.equal(queue.getSnapshot().values.studentB, "late");
  await queue.flush();
  assert.deepEqual(queue.getSnapshot().values, { studentA: "present", studentB: "absent" });
  assert.equal(queue.getSnapshot().pending, false);
  assert.equal(queue.getSnapshot().status, "error");
});

test("attendance keeps newer status while a slow save finishes", async () => {
  const first = deferred();
  const second = deferred();
  const requests = [];
  const queue = new FieldAutosave(async (changes) => {
    requests.push(changes);
    await (requests.length === 1 ? first.promise : second.promise);
    return changes;
  }, assert.fail, 1000);
  queue.change("studentA", "present", null);
  const saving = queue.flush();
  queue.change("studentA", "late", null);
  queue.change("studentB", "excused", null);
  first.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(queue.getSnapshot().values.studentA, "late");
  assert.equal(queue.getSnapshot().pending, true);
  assert.deepEqual(requests[1], { studentA: "late", studentB: "excused" });
  second.resolve();
  await saving;
  assert.equal(queue.getSnapshot().status, "saved");
});

test("rolls back failure without discarding newer clicks, and allows retry", async () => {
  const first = deferred();
  const errors = [];
  let calls = 0;
  const queue = new ChecklistAutosave(() => ++calls === 1 ? first.promise : Promise.resolve(), (error) => errors.push(error), 1000);
  queue.change("zoom_link_sent", true, false);
  queue.change("slides_sent", false, true);
  const saving = queue.flush();
  queue.change("zoom_link_sent", false, false);
  first.reject(new Error("Unavailable"));
  await saving;
  assert.equal(errors.length, 1);
  assert.equal(queue.getSnapshot().values.slides_sent, true);
  assert.equal(queue.getSnapshot().values.zoom_link_sent, false);
  assert.equal(queue.getSnapshot().status, "error");
  queue.change("slides_sent", false, true);
  await queue.flush();
  assert.equal(queue.getSnapshot().values.slides_sent, false);
  assert.equal(queue.getSnapshot().status, "saved");
});
