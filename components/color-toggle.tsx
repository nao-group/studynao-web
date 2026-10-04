"use client";
import { ActionIcon, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
export function ColorToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");
  const mounted = useMounted();
  const isDark = mounted && colorScheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  function toggle() {
    const next = isDark ? "light" : "dark";
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      document.startViewTransition(() => setColorScheme(next));
    } else {
      setColorScheme(next);
    }
  }

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon variant="subtle" size="lg" radius="xl" onClick={toggle} aria-label={label}>
        {isDark ? <IconSun size={19} stroke={1.8} /> : <IconMoon size={19} stroke={1.8} />}
      </ActionIcon>
    </Tooltip>
  );
}
