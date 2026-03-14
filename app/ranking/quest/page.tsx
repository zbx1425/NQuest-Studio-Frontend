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
import { useAuth } from "@/lib/hooks/useAuth";
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
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";
import type { TimePeriod, SpeedrunMode } from "@/lib/types";

const PAGE_SIZE = 50;

function SidebarSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-5 space-y-4">
      <div className="space-y-3">
        <div className="h-7 w-40 bg-white/60 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/40 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-white/40 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-white/40 rounded-full animate-pulse" />
        <div className="h-5 w-20 bg-white/40 rounded-full animate-pulse" />
      </div>
      <div className="border-t border-gray-200/50 pt-4 space-y-3">
        <div className="h-8 w-full bg-white/40 rounded-lg animate-pulse" />
        <div className="h-8 w-full bg-white/40 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

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

  const { data: wrLb, isLoading: wrLoading } = useGetSpeedrunLeaderboardQuery(
    {
      questId,
      period: "all_time",
      mode: "personal_best",
      limit: 1,
      offset: 0,
    },
    { skip: !questId }
  );
  const wrEntry = wrLb?.entries?.[0] ?? null;

  const {
    data: lb,
    isLoading: lbLoading,
    refetch: refetchLb,
  } = useGetSpeedrunLeaderboardQuery(
    { questId, period, mode, limit: PAGE_SIZE, offset },
    { skip: !questId }
  );

  if (!questId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>{t("noQuestId")}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const columns: ColumnDef[] = [
    {
      label: quest?.excludeFirstStep ? t("rankedTime") : t("time"),
      className: "font-mono",
    },
    ...(quest?.excludeFirstStep
      ? [
          {
            label: t("totalTime"),
            className: "font-mono text-gray-500 text-xs",
          },
        ]
      : []),
    { label: "" },
    { label: "" },
  ];

  const rows: LeaderboardRow[] = (lb?.entries ?? []).map((e) => ({
    id: e.completionId ?? `${e.rank}-${e.playerUuid}`,
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [
      <DurationDisplay key="t" ms={e.rankingDurationMillis} />,
      ...(quest?.excludeFirstStep
        ? [<DurationDisplay key="tt" ms={e.durationMillis} />]
        : []),
      <span key="d" className="text-gray-500 text-xs">
        {formatDistanceToNow(new Date(e.completionTime), {
          addSuffix: true,
          locale: dateLocale,
        })}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:self-start space-y-4">
          {questLoading ? (
            <SidebarSkeleton />
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-5 space-y-4">
                {/* Quest name & QP */}
                <div>
                  <div className="flex items-start gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      {quest?.name ?? questId}
                    </h1>
                    <Badge
                      appearance="filled"
                      color="brand"
                      size="medium"
                      className="mt-0.5"
                    >
                      {quest?.questPoints ?? 0} QP
                    </Badge>
                  </div>

                  {quest?.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {quest.description}
                    </p>
                  )}
                </div>

                {/* Category & Author */}
                <div className="flex items-center gap-2 flex-wrap">
                  {quest?.category && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/70 text-gray-700">
                      <TagRegular className="text-[12px]" />
                      {quest.category}
                      {quest.tier && (
                        <>
                          <span className="text-gray-300">/</span>
                          <span>{quest.tier}</span>
                        </>
                      )}
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

              {/* Filter controls */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t("filters")}
                </p>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-600">{t("timePeriod")}</p>
                  <PeriodSelector
                    value={period}
                    onChange={(p) => {
                      setPeriod(p);
                      setOffset(0);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-600">{t("mode")}</p>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 w-full">
                    <button
                      onClick={() => {
                        setMode("personal_best");
                        setOffset(0);
                      }}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        mode === "personal_best"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t("personalBest")}
                    </button>
                    <button
                      onClick={() => {
                        setMode("all_runs");
                        setOffset(0);
                      }}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        mode === "all_runs"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t("allRuns")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* World Record banner */}
          {!wrLoading && wrEntry && (
            <div className="rounded-lg border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
              <div className="flex items-center gap-4">
                <TrophyRegular className="text-amber-600 text-xl" />
                <PlayerLink
                  playerUuid={wrEntry.playerUuid}
                  playerName={wrEntry.playerName}
                  avatarSize={32}
                />
                <div className="flex flex-row gap-3">
                  <DurationDisplay
                    ms={wrEntry.rankingDurationMillis}
                    className="text-lg font-bold text-amber-900 leading-none"
                  />
                  {quest?.excludeFirstStep &&
                    wrEntry.durationMillis !==
                      wrEntry.rankingDurationMillis && (
                      <span className="text-xs text-amber-700/70 mt-0.5">
                        (<DurationDisplay ms={wrEntry.durationMillis} />)
                      </span>
                    )}
                </div>
                <span className="text-xs text-amber-600 ml-auto">
                  {formatDistanceToNow(new Date(wrEntry.completionTime), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
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
        </div>
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
