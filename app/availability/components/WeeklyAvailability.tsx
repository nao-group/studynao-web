"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Text } from "@mantine/core";
import type { WeeklyBlock } from "@/lib/types";
import styles from "./weekly-availability.module.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START = 7 * 60;
const COUNT = 60;
const key = (weekday: number, index: number) => weekday * COUNT + index;
const label = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

function toCells(blocks: WeeklyBlock[]) {
  const cells = new Set<number>();
  for (const block of blocks) for (let minute = block.start_minute; minute < block.end_minute; minute += 15) cells.add(key(block.weekday, (minute - START) / 15));
  return cells;
}

export function toBlocks(cells: Set<number>): WeeklyBlock[] {
  const blocks: WeeklyBlock[] = [];
  for (let day = 0; day < 7; day++) {
    let start = -1;
    for (let index = 0; index <= COUNT; index++) {
      const active = index < COUNT && cells.has(key(day, index));
      if (active && start < 0) start = index;
      if (!active && start >= 0) { blocks.push({ weekday: day, start_minute: START + start * 15, end_minute: START + index * 15 }); start = -1; }
    }
  }
  return blocks;
}

export function WeeklyAvailability({ initial, onChange }: { initial: WeeklyBlock[]; onChange: (blocks: WeeklyBlock[]) => void }) {
  const [cells, setCells] = useState<Set<number>>(() => toCells(initial));
  const cellsRef = useRef(cells);
  const dragRef = useRef<{ add: boolean; pointerId: number } | null>(null);
  useEffect(() => { const stop = () => { dragRef.current = null; }; window.addEventListener("pointerup", stop); window.addEventListener("pointercancel", stop); return () => { window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); }; }, []);
  const rows = useMemo(() => Array.from({ length: COUNT }, (_, index) => START + index * 15), []);

  function update(day: number, index: number, add: boolean) {
    if (cellsRef.current.has(key(day, index)) === add) return;
    const next = new Set(cellsRef.current);
    if (add) next.add(key(day, index)); else next.delete(key(day, index));
    cellsRef.current = next;
    setCells(next);
    onChange(toBlocks(next));
  }

  return <div><Group justify="space-between" mb="sm"><Text size="sm" fw={600}>Weekly availability · Jakarta (WIB)</Text><Text size="xs" c="dimmed">Drag to block time, or tap individual 15-minute cells.</Text></Group>
    <div className={styles.scroll} role="group" aria-label="Weekly availability, Jakarta time"><div className={styles.grid} onPointerMove={(event) => { const drag = dragRef.current; if (!drag || drag.pointerId !== event.pointerId) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-weekday][data-index]"); if (target) update(Number(target.dataset.weekday), Number(target.dataset.index), drag.add); }}>
      <div className={styles.corner}>WIB</div>{DAYS.map((day) => <div className={styles.day} key={day}>{day}</div>)}
      {rows.map((minute, index) => <div className={styles.row} key={minute}><div className={styles.time}>{index % 4 === 0 ? label(minute) : ""}</div>{DAYS.map((day, weekday) => {
        const active = cells.has(key(weekday, index));
        return <button key={day} type="button" className={styles.cell} data-active={active || undefined} data-weekday={weekday} data-index={index} aria-label={`${day} ${label(minute)}–${label(minute + 15)}`} aria-pressed={active} onPointerDown={(event) => { event.preventDefault(); const add = !active; dragRef.current = { add, pointerId: event.pointerId }; event.currentTarget.setPointerCapture(event.pointerId); update(weekday, index, add); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); update(weekday, index, !active); } }} />;
      })}</div>)}
    </div></div>
  </div>;
}
