"use client";

import { Badge } from "@fluentui/react-components";
import { useTranslations } from "next-intl";

const STATUS_COLORS: Record<string, "informative" | "warning" | "success"> = {
  PRIVATE: "informative",
  STAGING: "warning",
  PUBLIC: "success",
};

const STATUS_KEYS: Record<string, string> = {
  PRIVATE: "private",
  STAGING: "staging",
  PUBLIC: "public",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("status");
  const color = STATUS_COLORS[status] ?? "informative";
  const key = STATUS_KEYS[status];
  return (
    <Badge appearance="filled" color={color}>
      {key ? t(key as "private" | "staging" | "public") : status}
    </Badge>
  );
}
