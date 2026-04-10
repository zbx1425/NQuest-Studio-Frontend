"use client";

import {
  Input,
  Button,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import {
  FilterRegular,
  DismissRegular,
} from "@fluentui/react-icons";
import type { AuditAction, AuditTargetType, AuditLogQuery } from "@/lib/types";

const ALL_ACTIONS: AuditAction[] = [
  "QUEST_CREATE",
  "QUEST_UPDATE",
  "QUEST_DELETE",
  "QUEST_STATUS_CHANGE",
  "QUEST_PROMOTE",
  "CATEGORY_CREATE",
  "CATEGORY_UPDATE",
  "CATEGORY_DELETE",
  "ACL_UPDATE",
  "QP_ADJUST",
  "COMPLETION_DQ",
  "ADMIN_GRANT",
  "ADMIN_DEDUCT",
  "PLAYER_BAN",
  "PLAYER_PARDON",
  "COMPLETION_SUBMIT",
];

const ALL_TARGET_TYPES: AuditTargetType[] = [
  "quest",
  "category",
  "player",
  "completion",
];

interface AuditFiltersProps {
  filters: AuditLogQuery;
  onChange: (filters: AuditLogQuery) => void;
  onReset: () => void;
}

export function AuditFilters({
  filters,
  onChange,
  onReset,
}: AuditFiltersProps) {
  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <FilterRegular className="text-gray-500" />
        <span className="text-sm font-semibold">Filters</span>
        {hasFilters && (
          <Button
            appearance="subtle"
            size="small"
            icon={<DismissRegular />}
            onClick={onReset}
          >
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Action</label>
          <Dropdown
            placeholder="All actions"
            value={filters.action ?? ""}
            selectedOptions={filters.action ? [filters.action] : []}
            onOptionSelect={(_, data) =>
              onChange({
                ...filters,
                action: (data.optionValue as AuditAction) || undefined,
                offset: 0,
              })
            }
            clearable
          >
            {ALL_ACTIONS.map((a) => (
              <Option key={a} value={a}>
                {a}
              </Option>
            ))}
          </Dropdown>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Target Type</label>
          <Dropdown
            placeholder="All types"
            value={filters.targetType ?? ""}
            selectedOptions={filters.targetType ? [filters.targetType] : []}
            onOptionSelect={(_, data) =>
              onChange({
                ...filters,
                targetType:
                  (data.optionValue as AuditTargetType) || undefined,
                offset: 0,
              })
            }
            clearable
          >
            {ALL_TARGET_TYPES.map((t) => (
              <Option key={t} value={t}>
                {t}
              </Option>
            ))}
          </Dropdown>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Search Target ID</label>
          <Input
            value={filters.search ?? ""}
            onChange={(_, data) =>
              onChange({ ...filters, search: data.value || undefined, offset: 0 })
            }
            placeholder="Fuzzy search..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Target ID (exact)</label>
          <Input
            value={filters.targetId ?? ""}
            onChange={(_, data) =>
              onChange({
                ...filters,
                targetId: data.value || undefined,
                offset: 0,
              })
            }
            placeholder="e.g. mtr-central-line"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Actor ID</label>
          <Input
            value={filters.actorId ?? ""}
            onChange={(_, data) =>
              onChange({
                ...filters,
                actorId: data.value || undefined,
                offset: 0,
              })
            }
            placeholder="Discord User ID or api-key"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Time Range</label>
          <div className="flex items-center gap-1.5">
            <input
              type="datetime-local"
              aria-label="Since"
              title="Since"
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={
                filters.since
                  ? new Date(filters.since).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onChange({
                  ...filters,
                  since: e.target.value
                    ? new Date(e.target.value).getTime()
                    : undefined,
                  offset: 0,
                })
              }
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="datetime-local"
              aria-label="Until"
              title="Until"
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              value={
                filters.until
                  ? new Date(filters.until).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onChange({
                  ...filters,
                  until: e.target.value
                    ? new Date(e.target.value).getTime()
                    : undefined,
                  offset: 0,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
