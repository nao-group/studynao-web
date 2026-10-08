"use client";

import { ActionIcon, Anchor, Group, Tooltip } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { notifyError, notifySuccess } from "@/lib/feedback";

export function PurchaseLink({ url }: { url: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notifySuccess("Link copied", "The purchase link has been copied to your clipboard.");
    } catch {
      notifyError("Unable to copy the link. Please select and copy the URL manually.");
    }
  }

  return <Group gap="xs" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
    <Anchor href={url} target="_blank" rel="noopener noreferrer" style={{ minWidth: 0, overflowWrap: "anywhere" }}>{url}</Anchor>
    <Tooltip label="Copy purchase link" withArrow>
      <ActionIcon type="button" variant="subtle" color="yellow" radius="xl" size="md" aria-label="Copy purchase link" style={{ flexShrink: 0 }} onClick={() => void copy()}>
        <IconCopy size={18} aria-hidden="true" />
      </ActionIcon>
    </Tooltip>
  </Group>;
}
