"use client";

import { Button, type ButtonProps } from "@mantine/core";

export type LandingActionButtonProps = ButtonProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ButtonProps> & {
    presentation?: "compact" | "auth" | "otp";
    tone?: "primary" | "secondary";
  };

/** Primary action styling shared with ThinkNao. */
export function LandingActionButton({
  className,
  presentation = "compact",
  tone = "primary",
  ...props
}: LandingActionButtonProps) {
  const presentationClass =
    presentation === "auth"
      ? "auth-primary-action"
      : presentation === "otp"
        ? "auth-otp-action"
        : "";

  return (
    <Button
      {...props}
      className={[
        "landing-action-button",
        tone === "secondary" ? "landing-action-button--secondary" : "",
        presentationClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
