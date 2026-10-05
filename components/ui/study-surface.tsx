import { Card, Paper, type CardProps, type PaperProps } from "@mantine/core";
import type { PropsWithChildren } from "react";
import styles from "./study-surface.module.css";

export function StudyCard({ className, ...props }: PropsWithChildren<CardProps>) {
  return <Card withBorder radius="lg" {...props} className={[styles.surface, className].filter(Boolean).join(" ")} />;
}

export function StudyPaper({ className, ...props }: PropsWithChildren<PaperProps>) {
  return <Paper withBorder radius="lg" {...props} className={[styles.surface, className].filter(Boolean).join(" ")} />;
}
