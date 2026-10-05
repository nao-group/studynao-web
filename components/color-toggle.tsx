"use client";
import { ActionIcon, Menu, Tooltip, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";
function useColorToggle() {
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

  return { isDark, label, toggle };
}

export function ColorToggle({ className }: { className?: string }) {
  const { isDark, label, toggle } = useColorToggle();
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon className={className} variant="subtle" size="lg" radius="xl" onClick={toggle} aria-label={label}>
        {isDark ? <IconSun size={19} stroke={1.8} /> : <IconMoon size={19} stroke={1.8} />}
      </ActionIcon>
    </Tooltip>
  );
}

export function ColorToggleMenuItem() {
  const { isDark, label, toggle } = useColorToggle();
  return <Menu.Item leftSection={isDark ? <IconSun size={17} /> : <IconMoon size={17} />} onClick={toggle}>{label}</Menu.Item>;
}
