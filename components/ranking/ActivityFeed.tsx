"use client";

import { Badge } from "@fluentui/react-components";
import {
  StarRegular,
  TrophyRegular,
} from "@fluentui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { useGetRecentActivityQuery } from "@/lib/store/rankingApi";
import { formatDurationShort } from "@/lib/utils/duration";
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";
import Link from "next/link";

interface ActivityFeedProps {
  limit?: number;
}

export function ActivityFeed({ limit = 15 }: ActivityFeedProps) {
  const { data, isLoading } = useGetRecentActivityQuery({ limit });
  const t = useTranslations("ranking");
  const tc = useTranslations("common");
  const dateLocale = useDateLocale();

  if (isLoading) {
    return (
      <div className="space-y-0.5 max-h-[480px] overflow-y-auto">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex items-start gap-2 px-2 py-2 rounded-lg"
          >
            <div className="w-6 h-6 rounded bg-gray-200 animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.entries.length) {
    return <p className="text-sm text-gray-500 py-4">{t("noRecentActivity")}</p>;
  }

  return (
    <div className="space-y-0.5 max-h-[480px] overflow-y-auto">
      {data.entries.map((entry, i) => (
        <div
          key={`${entry.playerUuid}-${entry.completionTime}-${i}`}
          className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://vzge.me/face/256/${entry.playerUuid}`}
            alt=""
            className="w-6 h-6 rounded [image-rendering:pixelated] mt-0.5 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate">
              <Link
                href={`/ranking/player?uuid=${encodeURIComponent(entry.playerUuid)}`}
                className="font-medium no-underline text-inherit hover:text-blue-600 transition-colors"
              >
                {entry.playerName}
              </Link>
              <span className="text-xs text-gray-400">{" "}{tc("completed")}</span>
            </p>
            <p className="text-sm truncate">
              <Link
                href={`/ranking/quest?id=${encodeURIComponent(entry.questId)}`}
                className="no-underline text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {entry.questName}
              </Link>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-700 font-semibold font-mono">
                {formatDurationShort(entry.rankingDurationMillis)}
              </span>
              {entry.rankingDurationMillis !== entry.durationMillis && (
                <span className="text-[10px] text-gray-500 font-mono opacity-80 decoration-[0.5px]">
                  ({formatDurationShort(entry.durationMillis)})
                </span>
              )}
              {(entry.isPersonalBest && !entry.isWorldRecord) && (
                <Badge
                  appearance="tint"
                  color="brand"
                  size="small"
                  icon={<StarRegular />}
                >
                  PB
                </Badge>
              )}
              {entry.isWorldRecord && (
                <Badge
                  appearance="filled"
                  color="danger"
                  size="small"
                  icon={<TrophyRegular />}
                >
                  WR
                </Badge>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {formatDistanceToNow(new Date(entry.completionTime), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
