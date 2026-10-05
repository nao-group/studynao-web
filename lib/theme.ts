import { createTheme } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "var(--font-poppins), sans-serif",
  headings: { fontFamily: "var(--font-poppins), sans-serif", fontWeight: "700" },
  primaryColor: "gold",
  colors: {
    gold: ["#fffdf0", "#fff8d9", "#fdedb8", "#fae090", "#f4c858", "#d4a017", "#a87f12", "#7e5e0d", "#543e08", "#2a1e03"],
    dark: ["#f2f6f7", "#dce8eb", "#bfd0d5", "#9fb4bc", "#79949e", "#345663", "#123541", "#0d2a35", "#09232e", "#061923"],
  },
  defaultRadius: "md",
});
