"use client";

import { notifications } from "@mantine/notifications";

export function notifyError(message: string, title = "Something went wrong") {
  notifications.show({ title, message, color: "red", autoClose: 5000 });
}

export function notifySuccess(title: string, message: string) {
  notifications.show({ title, message, color: "green", autoClose: 4000 });
}
