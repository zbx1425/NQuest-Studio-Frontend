"use client";

import { Badge } from "@fluentui/react-components";

const STATUS_CONFIG: Record<
  string,
  { color: "informative" | "warning" | "success"; label: string }
> = {
  PRIVATE: { color: "informative", label: "Private" },
  STAGING: { color: "warning", label: "Staging" },
  PUBLIC: { color: "success", label: "Public" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    color: "informative" as const,
    label: status,
  };
  return (
    <Badge appearance="filled" color={config.color}>
      {config.label}
    </Badge>
  );
}
