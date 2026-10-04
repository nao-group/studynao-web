"use client";

import Link from "next/link";
import { Button, Group, Text, Title } from "@mantine/core";
import { AuthFrame } from "@/components/auth-frame";
import { IconArrowRight } from "@tabler/icons-react";
export default function Home() {
  return <AuthFrame title="Get started with StudyNao" description="Use your existing NAO account or create a new one."><Title order={3} size="h4">Learning that fits your schedule.</Title><Text c="dimmed" mt="sm" mb="xl">For students and teachers, it all starts with a complete profile.</Text><Group grow><Button component={Link} href="/login" size="md" className="landing-action-button" rightSection={<IconArrowRight size={16} stroke={2.2} />}>Log in</Button><Button component={Link} href="/register" size="md" className="landing-action-button landing-action-button--secondary">Sign up</Button></Group></AuthFrame>;
}
