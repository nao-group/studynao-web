export const displayDate = (date: string) => new Date(`${date}T12:00:00+07:00`).toLocaleDateString("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
});
