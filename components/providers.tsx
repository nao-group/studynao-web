"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/lib/theme";

const colorSchemeManager = localStorageColorSchemeManager({ key: "nao-color-scheme" });
export function Providers({ children }: { children: React.ReactNode }) {
  return <MantineProvider theme={theme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}><Notifications position="top-right" />{children}</MantineProvider>;
}
