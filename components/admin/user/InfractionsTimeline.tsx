"use client";

import { useState } from "react";
import { Button, Badge, Tooltip } from "@fluentui/react-components";
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  GavelRegular,
  DismissCircleRegular,
} from "@fluentui/react-icons";
import { useGetPlayerInfractionsQuery } from "@/lib/store/api";
import type {
  InfractionEntry,
  BanInfractionDetails,
  DqInfractionDetails,
} from "@/lib/types";

const PAGE_SIZE = 10;

function formatTime(epoch: number): string {
  return new Date(epoch).toLocaleString();
}

function InfractionCard({ entry }: { entry: InfractionEntry }) {
  const isBan = entry.type === "BAN";
  const details = entry.details;

  if (isBan) {
    const ban = details as BanInfractionDetails;
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
        <div className="mt-0.5 shrink-0">
          <GavelRegular className="text-red-500 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              appearance="filled"
              color="danger"
              size="small"
            >
              BAN
            </Badge>
            <Badge
              appearance="outline"
              color={ban.banType === "PERM" ? "danger" : "warning"}
              size="small"
            >
              {ban.banType}
            </Badge>
            <span className="text-xs text-gray-400 ml-auto">
              <Tooltip
                content={String(entry.timestamp)}
                relationship="label"
              >
                <span>{formatTime(entry.timestamp)}</span>
              </Tooltip>
            </span>
          </div>
          <p className="text-sm text-gray-700 truncate">{ban.reason}</p>
          {ban.pardonedAt && (
            <p className="text-xs text-green-600 mt-1">
              Pardoned at {formatTime(ban.pardonedAt)}
              {ban.pardonReason && ` — ${ban.pardonReason}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  const dq = details as DqInfractionDetails;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
      <div className="mt-0.5 shrink-0">
        <DismissCircleRegular className="text-amber-500 text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge appearance="filled" color="warning" size="small">
            DQ
          </Badge>
          <span className="text-xs text-gray-500 font-mono">
            {dq.questName}
          </span>
          <span className="text-xs text-gray-400 ml-auto">
            <Tooltip
              content={String(entry.timestamp)}
              relationship="label"
            >
              <span>{formatTime(entry.timestamp)}</span>
            </Tooltip>
          </span>
        </div>
        <p className="text-sm text-gray-700 truncate">{dq.reason}</p>
      </div>
    </div>
  );
}

interface InfractionsTimelineProps {
  playerUuid: string;
}

export function InfractionsTimeline({
  playerUuid,
}: InfractionsTimelineProps) {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGetPlayerInfractionsQuery({
    uuid: playerUuid,
    limit: PAGE_SIZE,
    offset,
  });

  const entries = data?.entries ?? [];
  const total = data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">Infraction History</h3>

      {isLoading ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          Loading infractions...
        </div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          No infractions found.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <InfractionCard key={`${entry.type}-${idx}`} entry={entry} />
            ))}
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
