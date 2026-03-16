"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tab,
  TabList,
  Combobox,
  Option,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import {
  TrophyRegular,
  CheckmarkCircleRegular,
  SearchRegular,
  PersonRegular,
  LightbulbRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMinecraftProfile } from "@/lib/hooks/useMinecraftProfile";
import {
  useGetQpLeaderboardQuery,
  useGetCompletionsLeaderboardQuery,
  useGetPublicQuestsQuery,
  useSearchPlayersQuery,
} from "@/lib/store/rankingApi";
import { PeriodSelector } from "@/components/ranking/PeriodSelector";
import { ActivityFeed } from "@/components/ranking/ActivityFeed";
import {
  LeaderboardTable,
  type LeaderboardRow,
  type ColumnDef,
} from "@/components/ranking/LeaderboardTable";
import { useTranslations } from "next-intl";
import type { TimePeriod } from "@/lib/types";

const PAGE_SIZE = 50;
const PODIUM_COUNT = 3;

interface PodiumEntry {
  rank: number;
  playerUuid: string;
  playerName: string;
  displayValue: ReactNode;
}

const PODIUM_CFG = {
  1: { bg: "from-amber-50 to-yellow-50 border-amber-200", icon: "🥇", valCls: "text-amber-700", avatarPx: 56, pad: "pt-3" },
  2: { bg: "from-gray-50 to-slate-100 border-gray-300", icon: "🥈", valCls: "text-gray-600", avatarPx: 48, pad: "pt-6" },
  3: { bg: "from-orange-50 to-amber-50 border-orange-200", icon: "🥉", valCls: "text-orange-700", avatarPx: 44, pad: "pt-8" },
} as const;

function Podium({
  entries,
  highlightUuid,
}: {
  entries: PodiumEntry[];
  highlightUuid?: string | null;
}) {
  if (entries.length === 0) return null;

  const ordered = [
    entries.find((e) => e.rank === 2),
    entries.find((e) => e.rank === 1),
    entries.find((e) => e.rank === 3),
  ].filter((e): e is PodiumEntry => !!e);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4 mb-6">
      {ordered.map((entry) => {
        const c = PODIUM_CFG[entry.rank as 1 | 2 | 3];
        return (
          <Link
            key={entry.rank}
            href={`/ranking/player?uuid=${encodeURIComponent(entry.playerUuid)}`}
            className="no-underline text-inherit flex-1 max-w-50 h-full block"
          >
            <div
              className={`flex flex-col items-center gap-1.5 px-3 sm:px-5 pb-4 rounded-lg border bg-gradient-to-b ${c.bg} transition-all hover:shadow-md hover:-translate-y-0.5 ${
                highlightUuid === entry.playerUuid ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <span className="text-xl sm:text-2xl leading-none">{c.icon}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://vzge.me/face/256/${entry.playerUuid}`}
                alt=""
                className="rounded-lg [image-rendering:pixelated] w-13 h-13 mt-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = "hidden";
                }}
              />
              <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate max-w-full text-center">
                {entry.playerName}
              </p>
              <div className={`text-base sm:text-lg font-bold ${c.valCls} tabular-nums`}>
                {entry.displayValue}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4 mb-6">
      {[
        { pad: "pt-6", avatarCls: "w-12 h-12" },
        { pad: "pt-3", avatarCls: "w-14 h-14" },
        { pad: "pt-8", avatarCls: "w-11 h-11" },
      ].map((c, i) => (
        <div
          key={i}
          className={`flex flex-col items-center gap-1.5 px-3 sm:px-5 pb-4 rounded-lg border border-gray-200 bg-gray-50/80 flex-1 max-w-50`}
        >
          <div className="h-7 w-7 rounded-full bg-gray-200 animate-pulse" />
          <div
            className={`${c.avatarCls} rounded-lg bg-gray-200 animate-pulse`}
          />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function QpTab({
  period,
  highlightUuid,
}: {
  period: TimePeriod;
  highlightUuid?: string | null;
}) {
  const t = useTranslations("ranking");
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useGetQpLeaderboardQuery({
    period,
    limit: PAGE_SIZE,
    offset,
  });

  const allEntries = data?.entries ?? [];
  const isFirstPage = offset === 0;

  const podiumEntries: PodiumEntry[] = isFirstPage
    ? allEntries.slice(0, PODIUM_COUNT).map((e) => ({
        rank: e.rank,
        playerUuid: e.playerUuid,
        playerName: e.playerName,
        displayValue: e.value.toLocaleString(),
      }))
    : [];

  const tableEntries = isFirstPage
    ? allEntries.slice(PODIUM_COUNT)
    : allEntries;

  const columns: ColumnDef[] = [
    { label: t("qp"), className: "text-right font-mono" },
  ];

  const rows: LeaderboardRow[] = tableEntries.map((e) => ({
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [
      <span key="v" className="font-semibold">
        {e.value.toLocaleString()}
      </span>,
    ],
  }));

  if (!isLoading && allEntries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <TrophyRegular className="text-xl text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t("noQpData")}</p>
      </div>
    );
  }

  const showTable = isLoading || tableEntries.length > 0 || !isFirstPage;

  return (
    <>
      {isFirstPage &&
        (isLoading ? (
          <PodiumSkeleton />
        ) : (
          <Podium entries={podiumEntries} highlightUuid={highlightUuid} />
        ))}
      {showTable && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <LeaderboardTable
            isLoading={isLoading}
            rows={rows}
            columns={columns}
            total={data?.total ?? 0}
            offset={offset}
            limit={PAGE_SIZE}
            onOffsetChange={setOffset}
            highlightUuid={highlightUuid}
            emptyMessage={t("noQpData")}
          />
        </div>
      )}
    </>
  );
}

function CompletionsTab({
  period,
  highlightUuid,
}: {
  period: TimePeriod;
  highlightUuid?: string | null;
}) {
  const t = useTranslations("ranking");
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useGetCompletionsLeaderboardQuery({
    period,
    limit: PAGE_SIZE,
    offset,
  });

  const allEntries = data?.entries ?? [];
  const isFirstPage = offset === 0;

  const podiumEntries: PodiumEntry[] = isFirstPage
    ? allEntries.slice(0, PODIUM_COUNT).map((e) => ({
        rank: e.rank,
        playerUuid: e.playerUuid,
        playerName: e.playerName,
        displayValue: e.value.toLocaleString(),
      }))
    : [];

  const tableEntries = isFirstPage
    ? allEntries.slice(PODIUM_COUNT)
    : allEntries;

  const columns: ColumnDef[] = [
    { label: t("completions"), className: "text-right font-mono" },
  ];

  const rows: LeaderboardRow[] = tableEntries.map((e) => ({
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [
      <span key="v" className="font-semibold">
        {e.value.toLocaleString()}
      </span>,
    ],
  }));

  if (!isLoading && allEntries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CheckmarkCircleRegular className="text-xl text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t("noCompletionData")}</p>
      </div>
    );
  }

  const showTable = isLoading || tableEntries.length > 0 || !isFirstPage;

  return (
    <>
      {isFirstPage &&
        (isLoading ? (
          <PodiumSkeleton />
        ) : (
          <Podium entries={podiumEntries} highlightUuid={highlightUuid} />
        ))}
      {showTable && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <LeaderboardTable
            isLoading={isLoading}
            rows={rows}
            columns={columns}
            total={data?.total ?? 0}
            offset={offset}
            limit={PAGE_SIZE}
            onOffsetChange={setOffset}
            highlightUuid={highlightUuid}
            emptyMessage={t("noCompletionData")}
          />
        </div>
      )}
    </>
  );
}

function PlayerSearch() {
  const t = useTranslations("ranking");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useSearchPlayersQuery(
    { name: debouncedQuery, limit: 10 },
    { skip: debouncedQuery.length < 2 }
  );

  const results = data?.results ?? [];

  return (
    <Combobox
      placeholder={t("searchPlayerPlaceholder")}
      freeform
      value={query}
      onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
      onOptionSelect={(_, d) => {
        if (d.optionValue) {
          router.push(
            `/ranking/player?uuid=${encodeURIComponent(d.optionValue)}`
          );
        }
      }}
      expandIcon={isFetching ? <Spinner size="tiny" /> : <SearchRegular />}
      className="w-full"
    >
      {results.map((p) => (
        <Option key={p.playerUuid} value={p.playerUuid} text={p.playerName}>
          <div className="flex items-center gap-2 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://vzge.me/face/256/${p.playerUuid}`}
              alt=""
              className="w-4 h-4 rounded [image-rendering:pixelated]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span>{p.playerName}</span>
          </div>
        </Option>
      ))}
      {debouncedQuery.length >= 2 && !isFetching && results.length === 0 && (
        <Option value="" text="" disabled>
          {t("noPlayersFound")}
        </Option>
      )}
    </Combobox>
  );
}

function QuestSearch() {
  const t = useTranslations("ranking");
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { data: allQuestsData } = useGetPublicQuestsQuery({ size: 9999 });

  const questOptions = useMemo(() => {
    const items = allQuestsData?.items ?? [];
    if (!searchText.trim()) return items.slice(0, 30);
    const q = searchText.trim().toLowerCase();
    return items.filter(
      (quest) =>
        quest.name.toLowerCase().includes(q) ||
        quest.id.toLowerCase().includes(q)
    );
  }, [allQuestsData, searchText]);

  return (
    <Combobox
      placeholder={t("searchQuestPlaceholder")}
      freeform
      value={searchText}
      onInput={(e) => setSearchText((e.target as HTMLInputElement).value)}
      onOptionSelect={(_, d) => {
        if (d.optionValue) {
          router.push(
            `/ranking/quest?id=${encodeURIComponent(d.optionValue)}`
          );
        }
      }}
      expandIcon={<SearchRegular />}
      className="w-full"
    >
      {questOptions.map((q) => (
        <Option key={q.id} value={q.id} text={q.name}>
          <div className="flex items-center justify-between w-full">
            <span>{q.name}</span>
            <span className="text-xs text-gray-400 ml-2">
              {q.questPoints} QP
            </span>
          </div>
        </Option>
      ))}
      {searchText.trim().length >= 1 && questOptions.length === 0 && (
        <Option value="" text="" disabled>
          {t("noQuestsFound")}
        </Option>
      )}
    </Combobox>
  );
}

export default function RankingPage() {
  const t = useTranslations("ranking");
  const { user } = useAuth();
  const mcProfile = useMinecraftProfile(user?.mcUuid);
  const [activeTab, setActiveTab] = useState("qp");
  const [period, setPeriod] = useState<TimePeriod>("all_time");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MessageBar intent="info" className="mb-6">
        <MessageBarBody>{t("takeItEasy")}</MessageBarBody>
      </MessageBar>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, d) => setActiveTab(d.value as string)}
            >
              <Tab value="qp" icon={<TrophyRegular />}>
                {t("qpRanking")}
              </Tab>
              <Tab value="completions" icon={<CheckmarkCircleRegular />}>
                {t("completions")}
              </Tab>
            </TabList>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          {activeTab === "qp" && (
            <QpTab key={period} period={period} highlightUuid={user?.mcUuid} />
          )}
          {activeTab === "completions" && (
            <CompletionsTab key={period} period={period} highlightUuid={user?.mcUuid} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-5">
          {user?.mcUuid && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {t("myProfile")}
              </p>
              <Link
                href={`/ranking/player?uuid=${encodeURIComponent(user.mcUuid)}`}
                className="flex items-center gap-3 no-underline text-inherit hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://vzge.me/face/256/${user.mcUuid}`}
                  alt=""
                  className="w-10 h-10 rounded-lg [image-rendering:pixelated]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0">
                  {mcProfile.loading ? (
                    <Spinner size="tiny" />
                  ) : (
                    <p className="font-semibold truncate">
                      {mcProfile.username ?? user.mcUuid.slice(0, 8)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t("viewMyProfile")}
                  </p>
                </div>
                <PersonRegular className="ml-auto text-gray-400" />
              </Link>
            </div>
          )}

          <div className="rounded-lg border border-blue-300 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t("findPlayer")}
            </p>
            <PlayerSearch />
          </div>

          <div className="rounded-lg border border-orange-300 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t("findQuestLeaderboard")}
            </p>
            <QuestSearch />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t("recentActivity")}
            </p>
            <ActivityFeed limit={15} />
          </div>
        </aside>
      </div>
    </div>
  );
}
