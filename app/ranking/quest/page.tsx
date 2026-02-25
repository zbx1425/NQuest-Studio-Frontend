"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import {
  PeopleRegular,
  TimerRegular,
  ArrowTrendingRegular,
  DataBarVerticalRegular,
  TrophyRegular,
  PersonRegular,
  TagRegular,
  ShieldDismissRegular,
} from "@fluentui/react-icons";
import { formatDistanceToNow } from "date-fns";
import {
  useGetQuestDetailQuery,
  useGetSpeedrunLeaderboardQuery,
} from "@/lib/store/rankingApi";
import { useGetQuestStatsQuery } from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { StatCard } from "@/components/ranking/StatCard";
import { PlayerLink } from "@/components/ranking/PlayerLink";
import { DurationDisplay } from "@/components/ranking/DurationDisplay";
import { PeriodSelector } from "@/components/ranking/PeriodSelector";
import {
  LeaderboardTable,
  type LeaderboardRow,
  type ColumnDef,
} from "@/components/ranking/LeaderboardTable";
import { StepDurationsDetail } from "@/components/ranking/StepDurationsDetail";
import { DisqualifyDialog } from "@/components/ranking/DisqualifyDialog";
import { formatDuration } from "@/lib/utils/duration";
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";
import type { TimePeriod, SpeedrunMode } from "@/lib/types";

const PAGE_SIZE = 50;

export default function QuestLeaderboardPage() {
  const searchParams = useSearchParams();
  const questId = searchParams.get("id") ?? "";
  const { user, isAdmin } = useAuth();
  const t = useTranslations("ranking");
  const dateLocale = useDateLocale();

  const [period, setPeriod] = useState<TimePeriod>("all_time");
  const [mode, setMode] = useState<SpeedrunMode>("personal_best");
  const [offset, setOffset] = useState(0);
  const [dqTarget, setDqTarget] = useState<number | null>(null);

  const { data: quest, isLoading: questLoading } = useGetQuestDetailQuery(
    questId,
    { skip: !questId }
  );
  const { data: stats, isLoading: statsLoading } = useGetQuestStatsQuery(
    questId,
    { skip: !questId }
  );
  const { data: lb, isLoading: lbLoading, refetch: refetchLb } = useGetSpeedrunLeaderboardQuery(
    { questId, period, mode, limit: PAGE_SIZE, offset },
    { skip: !questId }
  );

  if (!questId) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>{t("noQuestId")}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const columns: ColumnDef[] = [
    { label: t("time"), className: "font-mono" },
    { label: "" },
    { label: "" },
  ];
  const rows: LeaderboardRow[] = (lb?.entries ?? []).map((e) => ({
    id: e.completionId ?? `${e.rank}-${e.playerUuid}`,
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [
      <DurationDisplay key="t" ms={e.durationMillis} />,
      <span key="d" className="text-gray-500 text-xs">
        {formatDistanceToNow(new Date(e.completionTime), { addSuffix: true, locale: dateLocale })}
      </span>,
      e.isWorldRecord ? (
        <Badge key="wr" appearance="filled" color="danger" size="small">
          WR
        </Badge>
      ) : null,
    ],
    expandContent:
      e.stepDetails || isAdmin ? (
        <div className="space-y-3">
          {e.stepDetails && (
            <StepDurationsDetail
              stepDetails={e.stepDetails}
              totalDuration={e.durationMillis}
            />
          )}
          {isAdmin && (
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
                {t("disqualify")}
              </Button>
            </div>
          )}
        </div>
      ) : undefined,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Quest Hero */}
      {questLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-14 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              {quest?.name ?? questId}
            </h1>
            <Badge appearance="filled" color="brand" size="medium" className="mt-1">
              {quest?.questPoints ?? 0} QP
            </Badge>
          </div>

          {quest?.description && (
            <p className="text-sm text-gray-600 mt-2">{quest.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {quest?.category && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                <TagRegular className="text-[12px]" />
                {quest.category}
                {quest.tier && <span className="text-gray-400">/</span>}
                {quest.tier && <span>{quest.tier}</span>}
              </span>
            )}
            {quest?.createdBy && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <PersonRegular className="text-[12px]" />
                {t("by", { author: quest.createdBy.username })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              icon={<DataBarVerticalRegular />}
              value={stats.totalRuns.toLocaleString()}
              label={t("totalRuns")}
              iconBg="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={<PeopleRegular />}
              value={stats.uniqueRunners.toLocaleString()}
              label={t("uniqueRunners")}
              iconBg="bg-purple-100 text-purple-600"
            />
            <StatCard
              icon={<TimerRegular />}
              value={formatDuration(stats.averageDurationMillis)}
              label={t("averageTime")}
              iconBg="bg-green-100 text-green-600"
            />
            <StatCard
              icon={<ArrowTrendingRegular />}
              value={formatDuration(stats.medianDurationMillis)}
              label={t("medianTime")}
              iconBg="bg-amber-100 text-amber-600"
            />
          </>
        ) : null}
      </div>

      {/* World Record card */}
      {!statsLoading && stats?.worldRecord && (
        <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrophyRegular className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">{t("worldRecord")}</span>
          </div>
          <div className="flex items-center gap-4">
            <PlayerLink
              playerUuid={stats.worldRecord.playerUuid}
              playerName={stats.worldRecord.playerName}
              avatarSize={32}
            />
            <DurationDisplay
              ms={stats.worldRecord.durationMillis}
              className="text-lg font-bold text-amber-900"
            />
            <span className="text-xs text-amber-600 ml-auto">
              {formatDistanceToNow(new Date(stats.worldRecord.completionTime), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <PeriodSelector
          value={period}
          onChange={(p) => { setPeriod(p); setOffset(0); }}
        />
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            onClick={() => { setMode("personal_best"); setOffset(0); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === "personal_best"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("personalBest")}
          </button>
          <button
            onClick={() => { setMode("all_runs"); setOffset(0); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === "all_runs"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("allRuns")}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <LeaderboardTable
          isLoading={lbLoading}
          rows={rows}
          columns={columns}
          total={lb?.total ?? 0}
          offset={offset}
          limit={PAGE_SIZE}
          onOffsetChange={setOffset}
          highlightUuid={user?.mcUuid}
          emptyMessage={t("noSpeedrunDataYet")}
        />
      </div>

      {dqTarget !== null && (
        <DisqualifyDialog
          completionId={dqTarget}
          open
          onClose={() => setDqTarget(null)}
          onSuccess={() => refetchLb()}
        />
      )}
    </div>
  );
}
