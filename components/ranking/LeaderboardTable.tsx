"use client";

import { useState } from "react";
import { Button } from "@fluentui/react-components";
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  ChevronUpRegular,
} from "@fluentui/react-icons";
import { PlayerLink } from "./PlayerLink";
import type { ReactNode } from "react";

interface LeaderboardTableProps {
  isLoading: boolean;
  rows: LeaderboardRow[];
  columns: ColumnDef[];
  total: number;
  offset: number;
  limit: number;
  onOffsetChange: (offset: number) => void;
  highlightUuid?: string | null;
  emptyMessage?: string;
}

export interface LeaderboardRow {
  id?: string | number;
  rank: number;
  playerUuid: string;
  playerName: string;
  cells: ReactNode[];
  expandContent?: ReactNode;
}

export interface ColumnDef {
  label: string;
  className?: string;
}

function rankStyle(rank: number): string {
  if (rank === 1) return "border-l-4 border-amber-400 bg-amber-50/50";
  if (rank === 2) return "border-l-4 border-gray-400 bg-gray-50/50";
  if (rank === 3) return "border-l-4 border-orange-400 bg-orange-50/50";
  return "border-l-4 border-transparent";
}

function rankLabel(rank: number): ReactNode {
  if (rank === 1) return <span className="text-amber-600 font-bold">#1</span>;
  if (rank === 2) return <span className="text-gray-500 font-bold">#2</span>;
  if (rank === 3) return <span className="text-orange-600 font-bold">#3</span>;
  return <span className="text-gray-500">#{rank}</span>;
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="border-b border-gray-100 border-l-4 border-l-transparent">
      <td className="py-2.5 px-3 text-center">
        <div className="h-4 w-6 bg-gray-200 rounded animate-pulse mx-auto" />
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse shrink-0" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </td>
      {Array.from({ length: colCount }, (_, i) => (
        <td key={i} className="py-2.5 px-3">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function LeaderboardTable({
  isLoading,
  rows,
  columns,
  total,
  offset,
  limit,
  onOffsetChange,
  highlightUuid,
  emptyMessage = "No data available.",
}: LeaderboardTableProps) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  if (!isLoading && rows.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-12">{emptyMessage}</p>
    );
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const totalCols = 2 + columns.length + 1;

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-2 px-3 w-14 text-gray-500 font-medium">Rank</th>
            <th className="py-2 px-3 text-gray-500 font-medium">Player</th>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`py-2 px-3 text-gray-500 font-medium ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
            <th className="py-2 px-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 10 }, (_, i) => (
                <SkeletonRow key={i} colCount={columns.length + 1} />
              ))
            : rows.map((row) => {
                const rowId = row.id ?? `${row.rank}-${row.playerUuid}`;
                const isHighlighted = highlightUuid === row.playerUuid;
                const isExpanded = expandedId === rowId;
                const hasExpand = !!row.expandContent;

                return (
                  <RowGroup key={rowId}>
                    <tr
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50/80 ${
                        hasExpand ? "cursor-pointer" : ""
                      } ${
                        isHighlighted
                          ? "!bg-blue-50/80 !border-l-4 !border-l-blue-500"
                          : rankStyle(row.rank)
                      }`}
                      onClick={
                        hasExpand
                          ? () =>
                              setExpandedId(isExpanded ? null : rowId)
                          : undefined
                      }
                    >
                      <td className="py-2.5 px-3 text-center">
                        {rankLabel(row.rank)}
                      </td>
                      <td className="py-2.5 px-3">
                        <PlayerLink
                          playerUuid={row.playerUuid}
                          playerName={row.playerName}
                        />
                      </td>
                      {row.cells.map((cell, i) => (
                        <td
                          key={i}
                          className={`py-2.5 px-3 ${columns[i]?.className ?? ""}`}
                        >
                          {cell}
                        </td>
                      ))}
                      <td className="py-2.5 px-1">
                        {hasExpand &&
                          (isExpanded ? (
                            <ChevronUpRegular className="text-gray-400" />
                          ) : (
                            <ChevronDownRegular className="text-gray-400" />
                          ))}
                      </td>
                    </tr>
                    {isExpanded && row.expandContent && (
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <td colSpan={totalCols} className="px-6 py-3">
                          {row.expandContent}
                        </td>
                      </tr>
                    )}
                  </RowGroup>
                );
              })}
        </tbody>
      </table>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronLeftRegular />}
            disabled={offset === 0}
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          >
            Prev
          </Button>
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronRightRegular />}
            iconPosition="after"
            disabled={offset + limit >= total}
            onClick={() => onOffsetChange(offset + limit)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function RowGroup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
