"use client";

import { useState } from "react";
import { Button, Badge, Tooltip } from "@fluentui/react-components";
import {
  ChevronLeftRegular,
  ChevronRightRegular,
} from "@fluentui/react-icons";
import { useGetPlayerBansQuery } from "@/lib/store/api";
import type { BanEntry } from "@/lib/types";

const PAGE_SIZE = 10;

function formatTime(epoch: number): string {
  return new Date(epoch).toLocaleString();
}

function BanStatusBadge({ entry }: { entry: BanEntry }) {
  if (entry.active) {
    return (
      <Badge appearance="filled" color="danger" size="small">
        Active
      </Badge>
    );
  }
  if (entry.pardonedAt) {
    return (
      <Badge appearance="filled" color="success" size="small">
        Pardoned
      </Badge>
    );
  }
  return (
    <Badge appearance="filled" color="subtle" size="small">
      Expired
    </Badge>
  );
}

interface BanHistoryTableProps {
  playerUuid: string;
}

export function BanHistoryTable({ playerUuid }: BanHistoryTableProps) {
  const [offset, setOffset] = useState(0);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined
  );

  const { data, isLoading } = useGetPlayerBansQuery({
    uuid: playerUuid,
    limit: PAGE_SIZE,
    offset,
    ...(filterActive !== undefined ? { active: filterActive } : {}),
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Ban History</h3>
        <div className="flex gap-1">
          {([
            [undefined, "All"],
            [true, "Active"],
          ] as const).map(([val, label]) => (
            <button
              key={label}
              onClick={() => {
                setFilterActive(val);
                setOffset(0);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterActive === val
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          Loading ban history...
        </div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          No ban records found.
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="text-left p-3 font-semibold w-16">ID</th>
                  <th className="text-left p-3 font-semibold w-20">Type</th>
                  <th className="text-left p-3 font-semibold">Reason</th>
                  <th className="text-left p-3 font-semibold w-44">Issued</th>
                  <th className="text-left p-3 font-semibold w-44">
                    Expires
                  </th>
                  <th className="text-center p-3 font-semibold w-24">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-xs text-gray-500">
                      {entry.id}
                    </td>
                    <td className="p-3">
                      <Badge
                        appearance="outline"
                        color={
                          entry.banType === "PERM" ? "danger" : "warning"
                        }
                        size="small"
                      >
                        {entry.banType}
                      </Badge>
                    </td>
                    <td className="p-3 max-w-xs truncate">{entry.reason}</td>
                    <td className="p-3 text-xs text-gray-600">
                      <Tooltip
                        content={String(entry.issuedAt)}
                        relationship="label"
                      >
                        <span>{formatTime(entry.issuedAt)}</span>
                      </Tooltip>
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {entry.expiresAt ? (
                        <Tooltip
                          content={String(entry.expiresAt)}
                          relationship="label"
                        >
                          <span>{formatTime(entry.expiresAt)}</span>
                        </Tooltip>
                      ) : (
                        <span className="text-red-500 font-medium">Never</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <BanStatusBadge entry={entry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <Button
                appearance="subtle"
                size="small"
                icon={<ChevronLeftRegular />}
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                appearance="subtle"
                size="small"
                icon={<ChevronRightRegular />}
                iconPosition="after"
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
