"use client";

import {
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
} from "@fluentui/react-components";
import { createElement } from "react";

const TOASTER_ID = "global-toaster";

export function useAppToast() {
  const { dispatchToast } = useToastController(TOASTER_ID);

  const success = (title: string, body?: string) => {
    dispatchToast(
      createElement(
        Toast,
        null,
        createElement(ToastTitle, null, title),
        body ? createElement(ToastBody, null, body) : null
      ),
      { intent: "success", timeout: 3000 }
    );
  };

  const error = (title: string, body?: string) => {
    dispatchToast(
      createElement(
        Toast,
        null,
        createElement(ToastTitle, null, title),
        body ? createElement(ToastBody, null, body) : null
      ),
      { intent: "error", timeout: 6000 }
    );
  };

  const warning = (title: string, body?: string) => {
    dispatchToast(
      createElement(
        Toast,
        null,
        createElement(ToastTitle, null, title),
        body ? createElement(ToastBody, null, body) : null
      ),
      { intent: "warning", timeout: 5000 }
    );
  };

  return { success, error, warning };
}

export function extractApiError(err: unknown): { title: string; body: string } {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data: { error?: string; message?: string } }).data;
    return {
      title: data.error ?? "Error",
      body: data.message ?? "An unexpected error occurred.",
    };
  }
  return { title: "Error", body: String(err) };
}
