"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Box, Group, Portal, SegmentedControl, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { WeeklyBlock } from "@/lib/types";
import styles from "./weekly-availability.module.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START = 7 * 60;
const COUNT = 60;
const key = (weekday: number, index: number) => weekday * COUNT + index;
const label = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
type Drag = { add: boolean; pointerId: number; weekday: number; start: number; end: number; base: Set<number> };
type Hover = { weekday: number; index: number; x: number; y: number };
const blockLabel = (block: WeeklyBlock) => `${DAYS[block.weekday]} ${label(block.start_minute)}–${label(block.end_minute)} WIB`;

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
  const dragRef = useRef<Drag | null>(null);
  const [dragRange, setDragRange] = useState<Drag | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [tool, setTool] = useState<"select" | "erase">("select");
  const rows = useMemo(() => Array.from({ length: COUNT }, (_, index) => START + index * 15), []);
  const blocks = useMemo(() => toBlocks(cells), [cells]);

  const replace = useCallback((next: Set<number>) => {
    cellsRef.current = next;
    setCells(next);
    onChange(toBlocks(next));
  }, [onChange]);

  useEffect(() => {
    const stop = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (event.type === "pointercancel") replace(drag.base);
      dragRef.current = null;
      setDragRange(null);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => { window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
  }, [replace]);

  function updateRange(drag: Drag) {
    const next = new Set(drag.base);
    for (let index = Math.min(drag.start, drag.end); index <= Math.max(drag.start, drag.end); index++) {
      if (drag.add) next.add(key(drag.weekday, index));
      else next.delete(key(drag.weekday, index));
    }
    replace(next);
  }

  function removeBlock(block: WeeklyBlock) {
    const next = new Set(cellsRef.current);
    for (let minute = block.start_minute; minute < block.end_minute; minute += 15) next.delete(key(block.weekday, (minute - START) / 15));
    replace(next);
  }

  function movePointer(event: React.PointerEvent<HTMLDivElement>) {
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-weekday][data-index]");
    if (!target || !event.currentTarget.contains(target)) { if (!dragRef.current) setHover(null); return; }
    const weekday = Number(target.dataset.weekday);
    const index = Number(target.dataset.index);
    setHover({ weekday, index, x: event.clientX, y: event.clientY });
    const drag = dragRef.current;
    if (drag && drag.pointerId === event.pointerId && drag.weekday === weekday && drag.end !== index) {
      const next = { ...drag, end: index };
      dragRef.current = next;
      setDragRange(next);
      updateRange(next);
    }
  }

  const activeBlock = hover && blocks.find((block) => block.weekday === hover.weekday && START + hover.index * 15 >= block.start_minute && START + hover.index * 15 < block.end_minute);
  const tooltip = dragRange
    ? `${dragRange.add ? "Block" : "Erase"} ${DAYS[dragRange.weekday]} ${label(START + Math.min(dragRange.start, dragRange.end) * 15)}–${label(START + (Math.max(dragRange.start, dragRange.end) + 1) * 15)} WIB`
    : activeBlock ? blockLabel(activeBlock) : hover ? `${DAYS[hover.weekday]} ${label(START + hover.index * 15)}–${label(START + (hover.index + 1) * 15)} WIB` : "";

  return <div className={styles.availability}><Group justify="space-between" mb="sm" gap="sm"><Box><Text size="sm" fw={700}>Weekly availability · Jakarta (WIB)</Text><Text size="xs" c="dimmed">Drag across 15-minute cells to select or erase a time range.</Text></Box><SegmentedControl size="sm" value={tool} onChange={(value) => setTool(value as "select" | "erase")} data={[{ value: "select", label: "Block time" }, { value: "erase", label: "Erase time" }]} aria-label="Availability editing tool" /></Group>
    <div className={styles.scroll} role="group" aria-label="Weekly availability, Jakarta time"><div className={styles.grid} onPointerMove={movePointer} onPointerLeave={() => { if (!dragRef.current) setHover(null); }}>
      <div className={styles.corner}>WIB</div>{DAYS.map((day) => <div className={styles.day} key={day}>{day}</div>)}
      {rows.map((minute, index) => <div className={styles.row} key={minute}><div className={styles.time}>{index % 4 === 0 ? label(minute) : ""}</div>{DAYS.map((day, weekday) => {
        const active = cells.has(key(weekday, index));
        const preview = dragRange?.weekday === weekday && index >= Math.min(dragRange.start, dragRange.end) && index <= Math.max(dragRange.start, dragRange.end);
        return <button key={day} type="button" className={styles.cell} data-active={active || undefined} data-preview={preview || undefined} data-erase={preview && !dragRange?.add || undefined} data-weekday={weekday} data-index={index} aria-label={`${day} ${label(minute)}–${label(minute + 15)}; ${active ? "available" : "not selected"}`} aria-pressed={active} onPointerDown={(event) => { event.preventDefault(); const drag = { add: tool === "erase" ? false : !active, pointerId: event.pointerId, weekday, start: index, end: index, base: cellsRef.current }; dragRef.current = drag; setDragRange(drag); setHover({ weekday, index, x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); updateRange(drag); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); const drag = { add: tool === "erase" ? false : !active, pointerId: -1, weekday, start: index, end: index, base: cellsRef.current }; updateRange(drag); } }} />;
      })}</div>)}
    </div></div>
    {hover && tooltip && <Portal><div className={styles.rangeTooltip} role="tooltip" style={{ left: Math.max(4, Math.min(hover.x + 3, window.innerWidth - 245)), top: Math.max(4, Math.min(hover.y + 3, window.innerHeight - 44)) }}>{tooltip}</div></Portal>}
    <div className={styles.selectedPanel}><Group justify="space-between" align="center" mb="sm"><Box><Text fw={700} size="sm">Selected time blocks</Text><Text size="xs" c="dimmed">{blocks.length} range{blocks.length === 1 ? "" : "s"} · hover a block to see its full time</Text></Box><LandingActionButton tone="secondary" size="xs" leftSection={<IconTrash size={15} />} onClick={() => replace(new Set())} disabled={blocks.length === 0}>Clear all</LandingActionButton></Group>
      {blocks.length === 0 ? <Text size="sm" c="dimmed">No time selected yet. Drag on the timetable to add your availability.</Text> : <div className={styles.blockList}>{blocks.map((block) => <Group key={`${block.weekday}-${block.start_minute}`} className={styles.blockItem} justify="space-between" gap="xs" wrap="nowrap" title={blockLabel(block)}><Text size="sm" fw={600}>{blockLabel(block)}</Text><ActionIcon variant="subtle" color="red" radius="xl" aria-label={`Remove ${blockLabel(block)}`} onClick={() => removeBlock(block)}><IconTrash size={16} /></ActionIcon></Group>)}</div>}
    </div>
  </div>;
}
