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

interface StatsTabProps {
  questId: string;
}

export function StatsTab({ questId }: StatsTabProps) {
  const { data: stats, isLoading, error } = useGetQuestStatsQuery(questId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="medium" label="Loading stats..." />
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar intent="warning">
        <MessageBarBody>
          No stats available for this quest yet. Stats are generated after players complete the quest.
        </MessageBarBody>
      </MessageBar>
    );
  }

  if (!stats) return null;

  const maxStepDuration = Math.max(
    ...stats.stepAnalytics.map((s) => s.avgDurationMillis),
    1
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Overview */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<DataBarVerticalRegular />}
            value={stats.totalRuns.toLocaleString()}
            label="Total Runs"
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<PeopleRegular />}
            value={stats.uniqueRunners.toLocaleString()}
            label="Unique Runners"
            iconBg="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={<TimerRegular />}
            value={formatDuration(stats.averageDurationMillis)}
            label="Average Time"
            iconBg="bg-green-100 text-green-600"
          />
          <StatCard
            icon={<ArrowTrendingRegular />}
            value={formatDuration(stats.medianDurationMillis)}
            label="Median Time"
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>
      </section>

      {/* World Record */}
      {stats.worldRecord && (
        <section>
          <h2 className="text-lg font-semibold mb-3">World Record</h2>
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
                })}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Step Analytics */}
      {stats.stepAnalytics.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Step Analytics</h2>
          <p className="text-sm text-gray-500 mb-4">
            Average and median duration for each step. The bar width represents relative time compared to the slowest step.
          </p>
          <div className="space-y-3">
            {stats.stepAnalytics.map((step) => {
              const pct = (step.avgDurationMillis / maxStepDuration) * 100;
              return (
                <div key={step.stepIndex} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      Step {step.stepIndex + 1}
                    </span>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>
                        Avg: <span className="font-mono">{formatDuration(step.avgDurationMillis)}</span>
                      </span>
                      <span>
                        Med: <span className="font-mono">{formatDuration(step.medianDurationMillis)}</span>
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
          View Public Leaderboard
        </Button>
      </Link>
    </div>
  );
}
