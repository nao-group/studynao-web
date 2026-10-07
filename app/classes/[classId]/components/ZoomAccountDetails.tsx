"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconEye, IconEyeOff } from "@tabler/icons-react";
import { notifyError } from "@/lib/feedback";
import type { TeacherSessionDetail } from "../types";
import styles from "../class-detail.module.css";

export function ZoomAccountDetails({ account }: { account: NonNullable<TeacherSessionDetail["zoom_account"]> }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy(field: "email" | "password") {
    try {
      await navigator.clipboard.writeText(account[field]);
      setCopied(field);
    } catch {
      notifyError("Unable to copy. Please allow clipboard access and try again.");
    }
  }

  function copyIcon(field: "email" | "password") {
    return <Tooltip label={copied === field ? "Copied" : `Copy ${field}`} withArrow>
      <ActionIcon className={styles.credentialAction} variant="subtle" radius="xl" size={40}
        aria-label={`Copy Zoom ${field}`} onClick={() => void copy(field)}>
        {copied === field ? <IconCheck size={18} /> : <IconCopy size={18} />}
      </ActionIcon>
    </Tooltip>;
  }

  return <>
    <Text fw={700}>{account.name}</Text>
    <div className={styles.credentialRow}>
      <Text c="dimmed" className={styles.credentialValue}>{account.email}</Text>
      {copyIcon("email")}
    </div>
    <div className={styles.credentialRow}>
      <Text size="sm" className={styles.credentialValue}>Password: <Text component="span" ff="monospace">{showPassword ? account.password : "••••••••"}</Text></Text>
      <Group gap={2} wrap="nowrap">
        {copyIcon("password")}
        <Tooltip label={showPassword ? "Hide password" : "Show password"} withArrow>
          <ActionIcon className={styles.credentialAction} variant="subtle" radius="xl" size={40}
            aria-label={showPassword ? "Hide Zoom password" : "Show Zoom password"}
            aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </div>
  </>;
}
