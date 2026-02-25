"use client";

import Link from "next/link";
import { Spinner, MessageBar, MessageBarBody, Button } from "@fluentui/react-components";
import {
  DataBarVerticalRegular,
  PeopleRegular,
  TimerRegular,
  ArrowTrendingRegular,
  TrophyRegular,
  OpenRegular,
} from "@fluentui/react-icons";
import { useGetQuestStatsQuery } from "@/lib/store/api";
import { StatCard } from "@/components/ranking/StatCard";
import { PlayerLink } from "@/components/ranking/PlayerLink";
import { DurationDisplay } from "@/components/ranking/DurationDisplay";
import { formatDuration } from "@/lib/utils/duration";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";

interface StatsTabProps {
  questId: string;
}

export function StatsTab({ questId }: StatsTabProps) {
  const { data: stats, isLoading, error } = useGetQuestStatsQuery(questId);
  const t = useTranslations("editor");
  const tr = useTranslations("ranking");
  const dateLocale = useDateLocale();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="medium" label={t("loadingStats")} />
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>
          {t("noStats")}
        </MessageBarBody>
      </MessageBar>
    );
  }

  if (!stats) return null;

  const maxStepDuration = Math.max(
    ...stats.stepAnalytics.map((s) => s.avgDurationMillis ?? 0),
    1
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Overview */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{tr("overview")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<DataBarVerticalRegular />}
            value={stats.totalRuns.toLocaleString()}
            label={tr("totalRuns")}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<PeopleRegular />}
            value={stats.uniqueRunners.toLocaleString()}
            label={tr("uniqueRunners")}
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={<TimerRegular />}
            value={formatDuration(stats.averageDurationMillis)}
            label={tr("averageTime")}
            iconBg="bg-green-100 text-green-600"
          />
          <StatCard
            icon={<ArrowTrendingRegular />}
            value={formatDuration(stats.medianDurationMillis)}
            label={tr("medianTime")}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>
      </section>

      {/* World Record */}
      {stats.worldRecord && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{tr("worldRecord")}</h2>
          <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
            <div className="flex items-center gap-4">
              <TrophyRegular className="text-amber-600 text-xl" />
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
        </section>
      )}

      {/* Step Analytics */}
      {stats.stepAnalytics.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("stepAnalytics")}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("stepAnalyticsDesc")}
          </p>
          <div className="space-y-3">
            {stats.stepAnalytics.map((step) => {
              const avg = step.avgDurationMillis ?? 0;
              const pct = (avg / maxStepDuration) * 100;
              return (
                <div key={step.stepIndex} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {step.description ?? tr("stepN", { n: step.stepIndex + 1 })}
                    </span>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>
                        {tr("avg", { value: formatDuration(step.avgDurationMillis) })}
                      </span>
                      <span>
                        {tr("med", { value: formatDuration(step.medianDurationMillis) })}
                      </span>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Link to public leaderboard */}
      <Link href={`/ranking/quest?id=${encodeURIComponent(questId)}`}>
        <Button appearance="subtle" icon={<OpenRegular />}>
          {t("viewPublicLeaderboard")}
        </Button>
      </Link>
    </div>
  );
}
