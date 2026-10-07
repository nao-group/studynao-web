export function positiveId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const sessionDate = (value: string) => new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric",
}).format(new Date(value));

export const sessionTime = (value: string) => new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false,
}).format(new Date(value));

export const sessionDateTime = (value: string) => `${sessionDate(value)} · ${sessionTime(value)} WIB`;

export const jakartaDay = (value: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
