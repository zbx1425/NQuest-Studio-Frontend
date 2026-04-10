"use client";

import { Badge, Tooltip, Button } from "@fluentui/react-components";
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  OpenRegular,
} from "@fluentui/react-icons";
import type { AuditLogEntry } from "@/lib/types";

const ACTION_COLORS: Record<string, "danger" | "warning" | "brand" | "informative" | "success" | "important" | "subtle"> = {
  PLAYER_BAN: "danger",
  PLAYER_PARDON: "success",
  COMPLETION_DQ: "danger",
  QUEST_DELETE: "danger",
  CATEGORY_DELETE: "danger",
  QUEST_CREATE: "success",
  CATEGORY_CREATE: "success",
  ADMIN_GRANT: "success",
  ADMIN_DEDUCT: "warning",
  QUEST_UPDATE: "brand",
  QUEST_STATUS_CHANGE: "brand",
  QUEST_PROMOTE: "brand",
  CATEGORY_UPDATE: "brand",
  ACL_UPDATE: "informative",
  QP_ADJUST: "warning",
  COMPLETION_SUBMIT: "subtle",
};

interface AuditTableProps {
  entries: AuditLogEntry[];
  total: number;
  pageSize: number;
  offset: number;
  isLoading: boolean;
  onOffsetChange: (offset: number) => void;
  onSelectEntry: (entry: AuditLogEntry) => void;
}

export function AuditTable({
  entries,
  total,
  pageSize,
  offset,
  isLoading,
  onOffsetChange,
  onSelectEntry,
}: AuditTableProps) {
  const page = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (isLoading) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        Loading audit log...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        No audit log entries match the current filters.
      </div>
    );
  }

  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left p-3 font-semibold w-12">ID</th>
              <th className="text-left p-3 font-semibold w-44">Time</th>
              <th className="text-left p-3 font-semibold">Action</th>
              <th className="text-left p-3 font-semibold">Actor</th>
              <th className="text-left p-3 font-semibold">Target</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectEntry(entry)}
              >
                <td className="p-3 font-mono text-xs text-gray-400">
                  {entry.id}
                </td>
                <td className="p-3 text-xs text-gray-600">
                  <Tooltip
                    content={String(entry.createdAt)}
                    relationship="label"
                  >
                    <span>
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </Tooltip>
                </td>
                <td className="p-3">
                  <Badge
                    appearance="filled"
                    color={ACTION_COLORS[entry.action] ?? "subtle"}
                    size="small"
                  >
                    {entry.action}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className="flex items-center gap-1.5">
                    <Badge
                      appearance="outline"
                      color={
                        entry.actorType === "API_KEY"
                          ? "subtle"
                          : "informative"
                      }
                      size="small"
                    >
                      {entry.actorType === "API_KEY" ? "API" : "USER"}
                    </Badge>
                    <span className="font-mono text-xs text-gray-600 truncate max-w-[120px]">
                      {entry.actorId}
                    </span>
                  </span>
                </td>
                <td className="p-3">
                  <span className="flex items-center gap-1.5">
                    <Badge
                      appearance="outline"
                      color="subtle"
                      size="small"
                    >
                      {entry.targetType}
                    </Badge>
                    <span className="font-mono text-xs text-gray-600 truncate max-w-[180px]">
                      {entry.targetId}
                    </span>
                  </span>
                </td>
                <td className="p-3">
                  <Tooltip content="View details" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<OpenRegular />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntry(entry);
                      }}
                    />
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <Button
          appearance="subtle"
          size="small"
          icon={<ChevronLeftRegular />}
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - pageSize))}
        >
          Previous
        </Button>
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages} ({total} entries)
        </span>
        <Button
          appearance="subtle"
          size="small"
          icon={<ChevronRightRegular />}
          iconPosition="after"
          disabled={offset + pageSize >= total}
          onClick={() => onOffsetChange(offset + pageSize)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
