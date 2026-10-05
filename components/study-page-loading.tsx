import { Center, Loader, Stack, Text } from "@mantine/core";

export function StudyPageLoading({ label }: { label: string }) {
  return <Center mih="calc(100dvh - 80px)" p="xl" role="status" aria-label={label}>
    <Stack align="center" gap="sm"><Loader color="yellow" aria-hidden="true" /><Text size="sm" c="dimmed">{label}</Text></Stack>
  </Center>;
}
