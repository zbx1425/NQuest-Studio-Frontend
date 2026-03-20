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
  StarRegular,
  HistoryRegular,
  CheckmarkCircleRegular,
  TimerRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  ShieldDismissRegular,
  ArrowUpRegular,
  ArrowDownRegular,
  TrophyRegular,
  DataBarVerticalRegular,
} from "@fluentui/react-icons";
import { formatDistanceToNow } from "date-fns";
import {
  useGetPlayerProfileQuery,
  useGetPlayerHistoryQuery,
  useGetPlayerPersonalBestsQuery,
} from "@/lib/store/rankingApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { QuestLink } from "@/components/ranking/QuestLink";
import { DurationDisplay } from "@/components/ranking/DurationDisplay";
import { StepDurationsDetail } from "@/components/ranking/StepDurationsDetail";
import { DisqualifyDialog } from "@/components/ranking/DisqualifyDialog";
import { QpGrantDeductDialog } from "@/components/ranking/QpGrantDeductDialog";
import { formatDurationShort } from "@/lib/utils/duration";
import { useTranslations, useLocale } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";

const HISTORY_PAGE_SIZE = 20;

function OverviewSection({ uuid }: { uuid: string }) {
  const t = useTranslations("ranking");
  const dateLocale = useDateLocale();
  const { data } = useGetPlayerProfileQuery(uuid);

  if (!data?.recentActivity.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <HistoryRegular className="text-xl text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t("noRecentActivity")}</p>
      </div>
    );
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
              <QuestLink
                questId={a.questId}
                questName={a.questName}
                className="text-sm font-medium"
              />
              {a.isPersonalBest && (
                <Badge
                  appearance="tint"
                  color="brand"
                  size="small"
                  icon={<StarRegular />}
                >
                  PB
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-semibold text-gray-700">
                {formatDurationShort(a.rankingDurationMillis)}
              </span>
              <span className="mx-1.5 opacity-50">&middot;</span>
              {formatDistanceToNow(new Date(a.completionTime), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySection({
  uuid,
  isAdmin,
}: {
  uuid: string;
  isAdmin: boolean;
}) {
  const t = useTranslations("ranking");
  const tc = useTranslations("common");
  const dateLocale = useDateLocale();
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dqTarget, setDqTarget] = useState<number | null>(null);
  const { data, isLoading, refetch } = useGetPlayerHistoryQuery({
    uuid,
    limit: HISTORY_PAGE_SIZE,
    offset,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!data?.entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CheckmarkCircleRegular className="text-xl text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t("noCompletionHistory")}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.total ?? 0) / HISTORY_PAGE_SIZE);
  const currentPage = Math.floor(offset / HISTORY_PAGE_SIZE) + 1;

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="py-2 px-3 text-gray-500 font-medium">
              {t("quest")}
            </th>
            <th className="py-2 px-3 text-gray-500 font-medium">
              {t("time")}
            </th>
            <th className="py-2 px-3 text-gray-500 font-medium text-xs">
              {t("totalTime")}
            </th>
            <th className="py-2 px-3 text-gray-500 font-medium text-right">
              {t("qp")}
            </th>
            <th className="py-2 px-3 text-gray-500 font-medium"></th>
            <th className="py-2 px-3 text-gray-500 font-medium w-12"></th>
            <th className="py-2 px-3 w-8" />
          </tr>
        </thead>
        <tbody>
          {data.entries.map((e) => {
            const canExpand =
              (!!e.stepDetails || isAdmin) && !e.disqualified;
            const isExpanded = expandedId === e.completionId;
            return (
              <HistoryRowGroup key={e.completionId}>
                <tr
                  className={`border-b border-gray-100 transition-colors ${
                    canExpand
                      ? "cursor-pointer hover:bg-gray-50/80"
                      : ""
                  } ${
                    e.disqualified
                      ? "opacity-60"
                      : "hover:bg-gray-50/80"
                  }`}
                  onClick={
                    canExpand
                      ? () =>
                          setExpandedId(
                            isExpanded ? null : e.completionId
                          )
                      : undefined
                  }
                >
                  <td className="py-2.5 px-3">
                    <QuestLink
                      questId={e.questId}
                      questName={e.questName}
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <DurationDisplay ms={e.rankingDurationMillis} />
                  </td>
                  <td className="py-2.5 px-3">
                    {e.durationMillis !== e.rankingDurationMillis && (
                      <DurationDisplay
                        ms={e.durationMillis}
                        className="text-gray-400 text-xs"
                      />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {e.questPoints}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(e.completionTime), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </td>
                  <td className="py-2.5 px-3 space-x-1">
                    {e.disqualified && (
                      <Badge
                        appearance="tint"
                        color="danger"
                        size="small"
                        icon={<ShieldDismissRegular />}
                      >
                        DQ
                      </Badge>
                    )}
                    {e.isPersonalBest && !e.disqualified && (
                      <Badge
                        appearance="tint"
                        color="brand"
                        size="small"
                      >
                        PB
                      </Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-1">
                    {canExpand &&
                      (isExpanded ? (
                        <ChevronUpRegular className="text-gray-400" />
                      ) : (
                        <ChevronDownRegular className="text-gray-400" />
                      ))}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <td colSpan={7} className="px-6 py-3 space-y-3">
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
                            {t("disqualify")}
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
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronLeftRegular />}
            disabled={offset === 0}
            onClick={() =>
              setOffset(Math.max(0, offset - HISTORY_PAGE_SIZE))
            }
          >
            {tc("prev")}
          </Button>
          <span className="text-xs text-gray-500">
            {tc("pageOf", { current: currentPage, total: totalPages })}
          </span>
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronRightRegular />}
            iconPosition="after"
            disabled={offset + HISTORY_PAGE_SIZE >= (data.total ?? 0)}
            onClick={() => setOffset(offset + HISTORY_PAGE_SIZE)}
          >
            {tc("next")}
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

const RANK_MEDALS: Record<number, string> = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" };

function BestTimesSection({ uuid }: { uuid: string }) {
  const t = useTranslations("ranking");
  const dateLocale = useDateLocale();
  const { data, isLoading } = useGetPlayerPersonalBestsQuery(uuid);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!data?.entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <TimerRegular className="text-xl text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t("noPersonalBests")}</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="py-2 px-3 text-gray-500 font-medium">
            {t("quest")}
          </th>
          <th className="py-2 px-3 text-gray-500 font-medium">
            {t("bestTime")}
          </th>
          <th className="py-2 px-3 text-gray-500 font-medium text-xs">
            {t("totalTime")}
          </th>
          <th className="py-2 px-3 text-gray-500 font-medium text-right">
            {t("rank")}
          </th>
          <th className="py-2 px-3 text-gray-500 font-medium"></th>
        </tr>
      </thead>
      <tbody>
        {data.entries.map((e) => (
          <tr
            key={e.questId}
            className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors ${
              e.rank <= 3
                ? e.rank === 1
                  ? "bg-amber-50/30"
                  : e.rank === 2
                    ? "bg-gray-50/30"
                    : "bg-orange-50/30"
                : ""
            }`}
          >
            <td className="py-2.5 px-3">
              <QuestLink
                questId={e.questId}
                questName={e.questName}
              />
            </td>
            <td className="py-2.5 px-3">
              <DurationDisplay ms={e.rankingDurationMillis} />
            </td>
            <td className="py-2.5 px-3">
              {e.durationMillis !== e.rankingDurationMillis && (
                <DurationDisplay
                  ms={e.durationMillis}
                  className="text-gray-400 text-xs"
                />
              )}
            </td>
            <td className="py-2.5 px-3 text-right">
              <span
                className={`font-semibold ${
                  e.rank === 1
                    ? "text-amber-600"
                    : e.rank <= 3
                      ? "text-orange-600"
                      : "text-gray-600"
                }`}
              >
                {RANK_MEDALS[e.rank] ?? ""} #{e.rank}
              </span>
            </td>
            <td className="py-2.5 px-3 text-xs text-gray-500">
              {formatDistanceToNow(new Date(e.completionTime), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SidebarSkeleton() {
  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-white/60 animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-32 bg-white/60 rounded animate-pulse" />
            <div className="h-4 w-44 bg-white/40 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") ?? "";
  const [activeTab, setActiveTab] = useState("overview");
  const { isAdmin } = useAuth();
  const [grantDeductMode, setGrantDeductMode] = useState<
    "grant" | "deduct" | null
  >(null);
  const t = useTranslations("ranking");
  const locale = useLocale();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetPlayerProfileQuery(uuid, { skip: !uuid });

  if (!uuid) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>{t("noPlayerUuid")}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="error">
          <MessageBarBody>{t("playerNotFound")}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const stats = profile
    ? [
        {
          value: profile.qpBalance.toLocaleString(),
          label: t("qp"),
          negative: profile.qpBalance < 0,
          icon: <StarRegular className="text-blue-600" />,
          iconBg: "bg-blue-100",
        },
        {
          value: profile.personalBestCount.toLocaleString(),
          label: t("questsCompleted"),
          icon: <CheckmarkCircleRegular className="text-green-600" />,
          iconBg: "bg-green-100",
        },
        {
          value: profile.totalQuestCompletions.toLocaleString(),
          label: t("totalRuns"),
          icon: <DataBarVerticalRegular className="text-purple-600" />,
          iconBg: "bg-purple-100",
        },
        {
          value: profile.worldRecordCount.toLocaleString(),
          label: t("worldRecords"),
          icon: <TrophyRegular className="text-amber-600" />,
          iconBg: "bg-amber-100",
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar - profile card */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:self-start space-y-3">
          {isLoading ? (
            <SidebarSkeleton />
          ) : profile ? (
            <>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://vzge.me/face/256/${profile.playerUuid}`}
                    alt=""
                    className="w-14 h-14 rounded-lg [image-rendering:pixelated] ring-2 ring-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 truncate">
                      {profile.playerName}
                    </h1>
                    {profile.firstCompletionTime && (
                      <p className="text-xs text-gray-500">
                        {t("playingSince", {
                          date: new Date(
                            profile.firstCompletionTime
                          ).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }),
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats list */}
              <div className="space-y-2">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
                  >
                    <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-base font-bold tabular-nums leading-tight ${
                          s.negative ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {s.value}
                      </p>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {/* Admin actions */}
          {!isLoading && profile && isAdmin && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {t("adminActions")}
              </p>
              <div className="flex gap-2">
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowUpRegular />}
                  onClick={() => setGrantDeductMode("grant")}
                  className="!text-green-700 flex-1"
                >
                  {t("grantQp")}
                </Button>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<ArrowDownRegular />}
                  onClick={() => setGrantDeductMode("deduct")}
                  className="!text-red-600 flex-1"
                >
                  {t("deductQp")}
                </Button>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        {!isLoading && profile && (
          <div className="flex-1 min-w-0 space-y-4">
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, d) => setActiveTab(d.value as string)}
            >
              <Tab value="overview" icon={<HistoryRegular />}>
                {t("recentActivity")}
              </Tab>
              <Tab value="history" icon={<CheckmarkCircleRegular />}>
                {t("history")}
              </Tab>
              <Tab value="bestTimes" icon={<TimerRegular />}>
                {t("bestTimes")}
              </Tab>
            </TabList>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              {activeTab === "overview" && <OverviewSection uuid={uuid} />}
              {activeTab === "history" && (
                <HistorySection uuid={uuid} isAdmin={isAdmin} />
              )}
              {activeTab === "bestTimes" && (
                <BestTimesSection uuid={uuid} />
              )}
            </div>
          </div>
        )}
      </div>

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
