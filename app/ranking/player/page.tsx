"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Tab,
  TabList,
  Spinner,
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  TrophyRegular,
  StarRegular,
  HistoryRegular,
  CheckmarkCircleRegular,
  ArrowTrendingRegular,
  CalendarRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  ShieldDismissRegular,
  ArrowUpRegular,
  ArrowDownRegular,
} from "@fluentui/react-icons";
import { formatDistanceToNow } from "date-fns";
import {
  useGetPlayerProfileQuery,
  useGetPlayerHistoryQuery,
  useGetPlayerPersonalBestsQuery,
} from "@/lib/store/rankingApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { StatCard } from "@/components/ranking/StatCard";
import { QuestLink } from "@/components/ranking/QuestLink";
import { DurationDisplay } from "@/components/ranking/DurationDisplay";
import { StepDurationsDetail } from "@/components/ranking/StepDurationsDetail";
import { DisqualifyDialog } from "@/components/ranking/DisqualifyDialog";
import { QpGrantDeductDialog } from "@/components/ranking/QpGrantDeductDialog";
import { formatDurationShort } from "@/lib/utils/duration";

const HISTORY_PAGE_SIZE = 20;

function OverviewSection({ uuid }: { uuid: string }) {
  const { data } = useGetPlayerProfileQuery(uuid);
  if (!data?.recentActivity.length) {
    return <p className="text-sm text-gray-500 py-4">No recent activity.</p>;
  }

  return (
    <div className="space-y-1">
      {data.recentActivity.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <QuestLink questId={a.questId} questName={a.questName} className="text-sm font-medium" />
              {a.isPersonalBest && (
                <Badge appearance="tint" color="brand" size="small" icon={<StarRegular />}>
                  PB
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDurationShort(a.durationMillis)} &middot;{" "}
              {formatDistanceToNow(new Date(a.completionTime), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySection({ uuid, isAdmin }: { uuid: string; isAdmin: boolean }) {
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dqTarget, setDqTarget] = useState<number | null>(null);
  const { data, isLoading, refetch } = useGetPlayerHistoryQuery({
    uuid,
    limit: HISTORY_PAGE_SIZE,
    offset,
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner size="medium" /></div>;
  }

  if (!data?.entries.length) {
    return <p className="text-sm text-gray-500 py-4">No completion history.</p>;
  }

  const totalPages = Math.ceil((data.total ?? 0) / HISTORY_PAGE_SIZE);
  const currentPage = Math.floor(offset / HISTORY_PAGE_SIZE) + 1;

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-2 px-3 text-gray-500 font-medium">Quest</th>
            <th className="py-2 px-3 text-gray-500 font-medium">Time</th>
            <th className="py-2 px-3 text-gray-500 font-medium text-right">QP</th>
            <th className="py-2 px-3 text-gray-500 font-medium">Date</th>
            <th className="py-2 px-3 text-gray-500 font-medium w-12"></th>
            <th className="py-2 px-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {data.entries.map((e) => {
            const canExpand = (!!e.stepDetails || isAdmin) && !e.disqualified;
            const isExpanded = expandedId === e.completionId;
            return (
              <HistoryRowGroup key={e.completionId}>
                <tr
                  className={`border-b border-gray-100 transition-colors ${canExpand ? "cursor-pointer hover:bg-gray-50/80" : ""} ${e.disqualified ? "opacity-60" : "hover:bg-gray-50/80"}`}
                  onClick={canExpand ? () => setExpandedId(isExpanded ? null : e.completionId) : undefined}
                >
                  <td className="py-2.5 px-3">
                    <QuestLink questId={e.questId} questName={e.questName} />
                  </td>
                  <td className="py-2.5 px-3">
                    <DurationDisplay ms={e.durationMillis} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{e.questPoints}</td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(e.completionTime), { addSuffix: true })}
                  </td>
                  <td className="py-2.5 px-3 space-x-1">
                    {e.disqualified && (
                      <Badge appearance="tint" color="danger" size="small" icon={<ShieldDismissRegular />}>DQ</Badge>
                    )}
                    {(e.isPersonalBest && !e.disqualified) && (
                      <Badge appearance="tint" color="brand" size="small">PB</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-1">
                    {canExpand && (
                      isExpanded
                        ? <ChevronUpRegular className="text-gray-400" />
                        : <ChevronDownRegular className="text-gray-400" />
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <td colSpan={6} className="px-6 py-3 space-y-3">
                      {e.stepDetails && (
                        <StepDurationsDetail
                          stepDetails={e.stepDetails}
                          totalDuration={e.durationMillis}
                        />
                      )}
                      {isAdmin && !e.disqualified && (
                        <div className="flex justify-end">
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<ShieldDismissRegular />}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setDqTarget(e.completionId);
                            }}
                            className="!text-red-600 hover:!bg-red-50"
                          >
                            Disqualify
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </HistoryRowGroup>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <Button appearance="subtle" size="small" icon={<ChevronLeftRegular />}
            disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - HISTORY_PAGE_SIZE))}>
            Prev
          </Button>
          <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
          <Button appearance="subtle" size="small" icon={<ChevronRightRegular />} iconPosition="after"
            disabled={offset + HISTORY_PAGE_SIZE >= (data.total ?? 0)}
            onClick={() => setOffset(offset + HISTORY_PAGE_SIZE)}>
            Next
          </Button>
        </div>
      )}
      {dqTarget !== null && (
        <DisqualifyDialog
          completionId={dqTarget}
          open
          onClose={() => setDqTarget(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}

function HistoryRowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function PersonalBestsSection({ uuid }: { uuid: string }) {
  const { data, isLoading } = useGetPlayerPersonalBestsQuery(uuid);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner size="medium" /></div>;
  }

  if (!data?.entries.length) {
    return <p className="text-sm text-gray-500 py-4">No personal bests.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="py-2 px-3 text-gray-500 font-medium">Quest</th>
          <th className="py-2 px-3 text-gray-500 font-medium">Best Time</th>
          <th className="py-2 px-3 text-gray-500 font-medium text-right">Rank</th>
          <th className="py-2 px-3 text-gray-500 font-medium">Date</th>
        </tr>
      </thead>
      <tbody>
        {data.entries.map((e) => (
          <tr key={e.questId} className="border-b border-gray-100 hover:bg-gray-50/80">
            <td className="py-2.5 px-3">
              <QuestLink questId={e.questId} questName={e.questName} />
            </td>
            <td className="py-2.5 px-3">
              <DurationDisplay ms={e.durationMillis} />
            </td>
            <td className="py-2.5 px-3 text-right">
              <span className={`font-semibold ${
                e.rank === 1 ? "text-amber-600" : e.rank <= 3 ? "text-orange-600" : "text-gray-600"
              }`}>
                #{e.rank}
              </span>
            </td>
            <td className="py-2.5 px-3 text-xs text-gray-500">
              {formatDistanceToNow(new Date(e.completionTime), { addSuffix: true })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") ?? "";
  const [activeTab, setActiveTab] = useState("overview");
  const { isAdmin } = useAuth();
  const [grantDeductMode, setGrantDeductMode] = useState<"grant" | "deduct" | null>(null);

  const { data: profile, isLoading, error, refetch } = useGetPlayerProfileQuery(uuid, {
    skip: !uuid,
  });

  if (!uuid) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>No player UUID provided.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="error">
          <MessageBarBody>
            Player not found or failed to load.
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
            </div>
          </>
        ) : profile ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://vzge.me/face/256/${profile.playerUuid}`}
              alt=""
              className="w-16 h-16 rounded-lg [image-rendering:pixelated]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <h1 className="text-2xl font-bold">{profile.playerName}</h1>
              {profile.firstCompletionTime && (
                <p className="text-sm text-gray-500">
                  Playing since{" "}
                  {new Date(profile.firstCompletionTime).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))
        ) : profile ? (
          <>
            <StatCard
              icon={<TrophyRegular />}
              value={profile.qpBalance.toLocaleString()}
              label="QP Balance"
              iconBg="bg-amber-100 text-amber-600"
              valueClassName={profile.qpBalance < 0 ? "text-red-600" : undefined}
            />
            <StatCard
              icon={<CheckmarkCircleRegular />}
              value={profile.totalQuestCompletions}
              label="Total Completions"
              iconBg="bg-green-100 text-green-600"
            />
            <StatCard
              icon={<ArrowTrendingRegular />}
              value={profile.personalBestCount}
              label="Personal Bests"
              iconBg="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={<CalendarRegular />}
              value={profile.worldRecordCount}
              label="World Records"
              iconBg="bg-red-100 text-red-600"
            />
          </>
        ) : null}
      </div>

      {/* Admin Action Bar */}
      {!isLoading && profile && isAdmin && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin Actions
          </span>
          <div className="flex gap-2">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowUpRegular />}
              onClick={() => setGrantDeductMode("grant")}
              className="!text-green-700"
            >
              Grant QP
            </Button>
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowDownRegular />}
              onClick={() => setGrantDeductMode("deduct")}
              className="!text-red-600"
            >
              Deduct QP
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isLoading && profile && (
        <>
          <TabList
            selectedValue={activeTab}
            onTabSelect={(_, d) => setActiveTab(d.value as string)}
          >
            <Tab value="overview" icon={<HistoryRegular />}>Overview</Tab>
            <Tab value="history" icon={<CheckmarkCircleRegular />}>History</Tab>
            <Tab value="pbs" icon={<StarRegular />}>Personal Bests</Tab>
          </TabList>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {activeTab === "overview" && <OverviewSection uuid={uuid} />}
            {activeTab === "history" && <HistorySection uuid={uuid} isAdmin={isAdmin} />}
            {activeTab === "pbs" && <PersonalBestsSection uuid={uuid} />}
          </div>
        </>
      )}

      {/* Grant / Deduct Dialog */}
      {grantDeductMode && profile && (
        <QpGrantDeductDialog
          playerUuid={uuid}
          playerName={profile.playerName}
          mode={grantDeductMode}
          open
          onClose={() => setGrantDeductMode(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
