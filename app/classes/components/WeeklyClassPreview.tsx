import type { WeeklyBlock } from "@/lib/types";
import styles from "./weekly-class-preview.module.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const time = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export function WeeklyClassPreview({ slots }: { slots: WeeklyBlock[] }) {
  return <div className={styles.wrap} aria-label="Weekly class timetable, Jakarta time"><div className={styles.grid}>{days.map((day, weekday) => <div className={styles.day} key={day}><strong>{day}</strong><div className={styles.track}>{slots.filter((slot) => slot.weekday === weekday).map((slot) => <div key={`${slot.start_minute}-${slot.end_minute}`} className={styles.block} style={{ top: `${(slot.start_minute - 420) / 900 * 100}%`, height: `${(slot.end_minute - slot.start_minute) / 900 * 100}%` }} title={`${day} ${time(slot.start_minute)}–${time(slot.end_minute)}`}><span>{time(slot.start_minute)}</span></div>)}</div></div>)}</div><small>07:00–22:00 WIB · {slots.map((slot) => `${days[slot.weekday]} ${time(slot.start_minute)}–${time(slot.end_minute)}`).join(" · ")}</small></div>;
}
