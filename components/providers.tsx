"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { DatesProvider } from "@mantine/dates";
import { theme } from "@/lib/theme";

const colorSchemeManager = localStorageColorSchemeManager({ key: "nao-color-scheme" });
export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}><DatesProvider settings={{ locale: "en", firstDayOfWeek: 1, weekendDays: [0, 6] }}><Notifications position="top-right" />{children}</DatesProvider></MantineProvider>;
}
