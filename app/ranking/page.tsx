"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tab,
  TabList,
  Combobox,
  Option,
  Button,
  Badge,
  Spinner,
} from "@fluentui/react-components";
import {
  TrophyRegular,
  CheckmarkCircleRegular,
  TimerRegular,
  SearchRegular,
  PersonRegular,
} from "@fluentui/react-icons";
import { StepDurationsDetail } from "@/components/ranking/StepDurationsDetail";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMinecraftProfile } from "@/lib/hooks/useMinecraftProfile";
import {
  useGetQpLeaderboardQuery,
  useGetCompletionsLeaderboardQuery,
  useGetSpeedrunLeaderboardQuery,
  useGetPublicQuestsQuery,
  useSearchPlayersQuery,
} from "@/lib/store/rankingApi";
import { formatDistanceToNow } from "date-fns";
import { PeriodSelector } from "@/components/ranking/PeriodSelector";
import { ActivityFeed } from "@/components/ranking/ActivityFeed";
import {
  LeaderboardTable,
  type LeaderboardRow,
  type ColumnDef,
} from "@/components/ranking/LeaderboardTable";
import { QuestLink } from "@/components/ranking/QuestLink";
import { DurationDisplay } from "@/components/ranking/DurationDisplay";
import type { TimePeriod, SpeedrunMode } from "@/lib/types";

const PAGE_SIZE = 50;

function QpTab({
  period,
  highlightUuid,
}: {
  period: TimePeriod;
  highlightUuid?: string | null;
}) {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGetQpLeaderboardQuery({
    period,
    limit: PAGE_SIZE,
    offset,
  });

  const columns: ColumnDef[] = [{ label: "QP", className: "text-right font-mono" }];
  const rows: LeaderboardRow[] = (data?.entries ?? []).map((e) => ({
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [<span key="v" className="font-semibold">{e.value.toLocaleString()}</span>],
  }));

  return (
    <LeaderboardTable
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      total={data?.total ?? 0}
      offset={offset}
      limit={PAGE_SIZE}
      onOffsetChange={setOffset}
      highlightUuid={highlightUuid}
      emptyMessage="No QP data yet."
    />
  );
}

function CompletionsTab({
  period,
  highlightUuid,
}: {
  period: TimePeriod;
  highlightUuid?: string | null;
}) {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGetCompletionsLeaderboardQuery({
    period,
    limit: PAGE_SIZE,
    offset,
  });

  const columns: ColumnDef[] = [
    { label: "Completions", className: "text-right font-mono" },
  ];
  const rows: LeaderboardRow[] = (data?.entries ?? []).map((e) => ({
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [<span key="v" className="font-semibold">{e.value.toLocaleString()}</span>],
  }));

  return (
    <LeaderboardTable
      isLoading={isLoading}
      rows={rows}
      columns={columns}
      total={data?.total ?? 0}
      offset={offset}
      limit={PAGE_SIZE}
      onOffsetChange={setOffset}
      highlightUuid={highlightUuid}
      emptyMessage="No completion data yet."
    />
  );
}

function SpeedrunTab({
  period,
  highlightUuid,
}: {
  period: TimePeriod;
  highlightUuid?: string | null;
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedQuestId, setSelectedQuestId] = useState("");
  const [selectedQuestName, setSelectedQuestName] = useState("");
  const [mode, setMode] = useState<SpeedrunMode>("personal_best");
  const [offset, setOffset] = useState(0);

  const { data: allQuestsData } = useGetPublicQuestsQuery({ size: 9999 });

  const { data, isLoading } = useGetSpeedrunLeaderboardQuery(
    { questId: selectedQuestId, period, mode, limit: PAGE_SIZE, offset },
    { skip: !selectedQuestId }
  );

  const questOptions = useMemo(() => {
    const items = allQuestsData?.items ?? [];
    if (!searchText.trim()) return items;
    const q = searchText.trim().toLowerCase();
    return items.filter(
      (quest) =>
        quest.name.toLowerCase().includes(q) ||
        quest.id.toLowerCase().includes(q)
    );
  }, [allQuestsData, searchText]);

  const columns: ColumnDef[] = [
    { label: "Time", className: "font-mono" },
    { label: "Date" },
    { label: "" },
  ];
  const rows: LeaderboardRow[] = (data?.entries ?? []).map((e) => ({
    id: e.completionId ?? `${e.rank}-${e.playerUuid}`,
    rank: e.rank,
    playerUuid: e.playerUuid,
    playerName: e.playerName,
    cells: [
      <DurationDisplay key="t" ms={e.durationMillis} />,
      <span key="d" className="text-gray-500 text-xs">
        {formatDistanceToNow(new Date(e.completionTime), { addSuffix: true })}
      </span>,
      e.isWorldRecord ? (
        <Badge key="wr" appearance="filled" color="danger" size="small">
          WR
        </Badge>
      ) : null,
    ],
    expandContent: e.stepDurations ? (
      <StepDurationsDetail
        stepDurations={e.stepDurations}
        totalDuration={e.durationMillis}
      />
    ) : undefined,
  }));

  return (
    <div className="space-y-4">
      <Combobox
        placeholder="Search quest by name..."
        freeform
        value={searchText}
        onInput={(e) => {
          setSearchText((e.target as HTMLInputElement).value);
        }}
        onOptionSelect={(_, d) => {
          if (d.optionValue) {
            setSelectedQuestId(d.optionValue);
            setSelectedQuestName(d.optionText ?? d.optionValue);
            setSearchText(d.optionText ?? d.optionValue);
            setOffset(0);
          }
        }}
        expandIcon={<SearchRegular />}
        className="w-full"
      >
        {questOptions.map((q) => (
          <Option key={q.id} value={q.id} text={q.name}>
            <div className="flex items-center justify-between w-full">
              <span>{q.name}</span>
              <span className="text-xs text-gray-400 ml-2">{q.questPoints} QP</span>
            </div>
          </Option>
        ))}
        {searchText.trim().length >= 1 && questOptions.length === 0 && (
          <Option value="" text="" disabled>
            No quests found
          </Option>
        )}
      </Combobox>

      {selectedQuestId && (
        <div className="flex items-center gap-3">
          <QuestLink questId={selectedQuestId} questName={selectedQuestName} className="font-semibold" />
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              onClick={() => { setMode("personal_best"); setOffset(0); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === "personal_best"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Personal Best
            </button>
            <button
              onClick={() => { setMode("all_runs"); setOffset(0); }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === "all_runs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Runs
            </button>
          </div>
        </div>
      )}

      {selectedQuestId ? (
        <LeaderboardTable
          isLoading={isLoading}
          rows={rows}
          columns={columns}
          total={data?.total ?? 0}
          offset={offset}
          limit={PAGE_SIZE}
          onOffsetChange={setOffset}
          highlightUuid={highlightUuid}
          emptyMessage="No speedrun data for this quest."
        />
      ) : (
        <p className="text-sm text-gray-500 text-center py-12">
          Search for a quest above to view its speedrun leaderboard.
        </p>
      )}
    </div>
  );
}

function PlayerSearch() {
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
      placeholder="Search by Minecraft name..."
      freeform
      value={query}
      onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
      onOptionSelect={(_, d) => {
        if (d.optionValue) {
          router.push(`/ranking/player?uuid=${encodeURIComponent(d.optionValue)}`);
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
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span>{p.playerName}</span>
          </div>
        </Option>
      ))}
      {debouncedQuery.length >= 2 && !isFetching && results.length === 0 && (
        <Option value="" text="" disabled>
          No players found
        </Option>
      )}
    </Combobox>
  );
}

export default function RankingPage() {
  const { user } = useAuth();
  const mcProfile = useMinecraftProfile(user?.mcUuid);
  const [activeTab, setActiveTab] = useState("qp");
  const [period, setPeriod] = useState<TimePeriod>("all_time");

  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leaderboards</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_, d) => setActiveTab(d.value as string)}
            >
              <Tab value="qp" icon={<TrophyRegular />}>
                QP Ranking
              </Tab>
              <Tab value="completions" icon={<CheckmarkCircleRegular />}>
                Completions
              </Tab>
              <Tab value="speedrun" icon={<TimerRegular />}>
                Speedrun
              </Tab>
            </TabList>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            {activeTab === "qp" && (
              <QpTab period={period} highlightUuid={user?.mcUuid} />
            )}
            {activeTab === "completions" && (
              <CompletionsTab period={period} highlightUuid={user?.mcUuid} />
            )}
            {activeTab === "speedrun" && (
              <SpeedrunTab period={period} highlightUuid={user?.mcUuid} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          {/* My Profile card */}
          {user?.mcUuid && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                My Profile
              </p>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://vzge.me/face/256/${user.mcUuid}`}
                  alt=""
                  className="w-10 h-10 rounded [image-rendering:pixelated]"
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
                </div>
              </div>
              <Button
                onClick={() => router.push(`/ranking/player?uuid=${encodeURIComponent(user.mcUuid ?? "")}`)}
                appearance="subtle"
                size="small"
                icon={<PersonRegular />}
                className="mt-3 w-full"
              >
                View My Profile
              </Button>
            </div>
          )}

          {/* Player Search */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Find Player
            </p>
            <PlayerSearch />
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Activity
            </p>
            <ActivityFeed limit={15} />
          </div>
        </aside>
      </div>
    </div>
  );
}
