"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  Tab,
  TabList,
  Button,
  Input,
  Label,
  Badge,
  Spinner,
  MessageBar,
  MessageBarBody,
  Divider,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import {
  PersonRegular,
  LinkRegular,
  LinkDismissRegular,
  ArrowDownloadRegular,
  TrophyRegular,
  WalletRegular,
  OpenRegular,
  CheckmarkCircleRegular,
  ArrowTrendingRegular,
  CalendarRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  StarRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBindMcMutation, useUnbindMcMutation } from "@/lib/store/api";
import {
  useGetPlayerProfileQuery,
  useGetPlayerTransactionsQuery,
} from "@/lib/store/rankingApi";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import type { RootState, AppDispatch } from "@/lib/store";
import { setBaseUrl, fetchSystemMap } from "@/lib/store/systemMapSlice";
import { useMinecraftProfile } from "@/lib/hooks/useMinecraftProfile";
import { StatCard } from "@/components/ranking/StatCard";
import { QuestLink } from "@/components/ranking/QuestLink";
import { formatDurationShort } from "@/lib/utils/duration";
import { formatDistanceToNow } from "date-fns";
import type { TransactionType } from "@/lib/types";

const TX_PAGE_SIZE = 20;
const TX_TYPE_LABELS: Record<TransactionType | "ALL", string> = {
  ALL: "All Types",
  QUEST_COMPLETION: "Quest Completion",
  SPEND: "Spend",
  EARN: "Earn",
  QP_ADJUSTMENT: "QP Adjustment",
  DISQUALIFY: "Disqualify",
  ADMIN_GRANT: "Admin Grant",
  ADMIN_DEDUCT: "Admin Deduct",
};
const TX_TYPE_COLORS: Record<string, "brand" | "danger" | "success" | "warning" | "informative"> = {
  QUEST_COMPLETION: "success",
  SPEND: "danger",
  QP_ADJUSTMENT: "warning",
  ADMIN_GRANT: "brand",
  ADMIN_DEDUCT: "danger",
  EARN: "success",
  DISQUALIFY: "danger",
};

function NeedsMcUuid() {
  return (
    <div className="py-4">
      <p className="text-sm text-gray-500">
        Link your Minecraft account in the Account tab to see your rankings.
      </p>
    </div>
  );
}

function AccountSection({
  user,
  isAdmin,
  isAuthor,
  mcUuid,
}: {
  user: { discordUserId: string; username: string };
  isAdmin: boolean;
  isAuthor: boolean;
  mcUuid: string | null;
}) {
  const toast = useAppToast();
  const dispatch = useDispatch<AppDispatch>();
  const mcProfile = useMinecraftProfile(mcUuid);
  const [bindMc, { isLoading: isBinding }] = useBindMcMutation();
  const [unbindMc, { isLoading: isUnbinding }] = useUnbindMcMutation();
  const [mcToken, setMcToken] = useState("");
  const systemMap = useSelector((state: RootState) => state.systemMap);

  const handleBind = async () => {
    try {
      const result = await bindMc({ token: mcToken }).unwrap();
      toast.success("Minecraft account linked", `UUID: ${result.mcUuid}`);
      setMcToken("");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handleUnbind = async () => {
    try {
      await unbindMc().unwrap();
      toast.success("Minecraft account unlinked");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handleFetchSystemMap = async () => {
    try {
      await dispatch(fetchSystemMap(systemMap.baseUrl)).unwrap();
      toast.success("System map data loaded");
    } catch (err) {
      toast.error("Failed to fetch system map", String(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Discord Account */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Discord Account</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{user.username}</span>
            {isAdmin && (
              <Badge appearance="filled" color="danger" size="small">Admin</Badge>
            )}
            {!isAdmin && isAuthor && (
              <Badge appearance="filled" color="brand" size="small">Author</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">Discord ID: {user.discordUserId}</p>
        </div>
      </section>

      <Divider />

      {/* Minecraft Account */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Minecraft Account</h2>
        {mcUuid ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {mcProfile.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mcProfile.avatarUrl}
                  alt="Minecraft avatar"
                  className="w-10 h-10 rounded [image-rendering:pixelated]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge appearance="outline" color="success" size="small">Linked</Badge>
                  {mcProfile.loading ? (
                    <Spinner size="tiny" />
                  ) : mcProfile.username ? (
                    <span className="font-semibold">{mcProfile.username}</span>
                  ) : null}
                </div>
                <p className="font-mono text-xs text-gray-500 truncate">{mcUuid}</p>
              </div>
            </div>
            <Button
              appearance="secondary"
              icon={<LinkDismissRegular />}
              onClick={handleUnbind}
              disabled={isUnbinding}
            >
              {isUnbinding ? "Unlinking..." : "Unlink Minecraft Account"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              To link your Minecraft account, run{" "}
              <code className="bg-gray-100 px-1 rounded">/idtoken</code> on the
              Minecraft server to get a token, then paste it below.
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="mc-token">Binding Token</Label>
                <Input
                  id="mc-token"
                  value={mcToken}
                  onChange={(_, d) => setMcToken(d.value)}
                  placeholder="Paste token from MC server..."
                  type="password"
                />
              </div>
              <Button
                appearance="primary"
                icon={<LinkRegular />}
                onClick={handleBind}
                disabled={!mcToken || isBinding}
              >
                {isBinding ? "Linking..." : "Link"}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* System Map (Author/Admin only) */}
      {(isAuthor || isAdmin) && (
        <>
          <Divider />
          <section>
            <h2 className="text-lg font-semibold mb-3">System Map API</h2>
            <p className="text-sm text-gray-600 mb-3">
              Configure the MTR System Map API to enable station and route
              autocomplete in the quest editor.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="sysmap-url">API Base URL</Label>
                <Input
                  id="sysmap-url"
                  value={systemMap.baseUrl}
                  onChange={(_, d) => dispatch(setBaseUrl(d.value))}
                  placeholder="https://..."
                />
              </div>
              <Button
                appearance="primary"
                icon={
                  systemMap.loading ? <Spinner size="tiny" /> : <ArrowDownloadRegular />
                }
                onClick={handleFetchSystemMap}
                disabled={systemMap.loading || !systemMap.baseUrl}
              >
                {systemMap.loading ? "Fetching..." : "Fetch Station & Route Data"}
              </Button>

              {systemMap.error && (
                <MessageBar intent="error">
                  <MessageBarBody>{systemMap.error}</MessageBarBody>
                </MessageBar>
              )}

              {systemMap.data && (
                <p className="text-xs text-gray-500 mt-2">
                  Loaded {systemMap.data.stationNames.length} stations and{" "}
                  {systemMap.data.routeNames.length} routes.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MyRankingsSection({ mcUuid }: { mcUuid: string | null }) {
  const { data: profile, isLoading } = useGetPlayerProfileQuery(mcUuid!, {
    skip: !mcUuid,
  });

  if (!mcUuid) return <NeedsMcUuid />;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" label="Loading your rankings..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-gray-500 py-4">
        No ranking data found. Complete some quests in-game to see your stats here.
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold">My Rankings</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
      </div>

      {profile.recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h3>
          <div className="space-y-1">
            {profile.recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <QuestLink questId={a.questId} questName={a.questName} className="text-sm font-medium" />
                {a.isPersonalBest && (
                  <Badge appearance="tint" color="brand" size="small" icon={<StarRegular />}>PB</Badge>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  {formatDurationShort(a.durationMillis)} &middot;{" "}
                  {formatDistanceToNow(new Date(a.completionTime), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/ranking/player?uuid=${encodeURIComponent(mcUuid)}`}>
        <Button appearance="subtle" icon={<OpenRegular />}>
          View Full Profile
        </Button>
      </Link>
    </div>
  );
}

function QpHistorySection({ mcUuid }: { mcUuid: string | null }) {
  const [offset, setOffset] = useState(0);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");

  const { data: profile } = useGetPlayerProfileQuery(mcUuid!, { skip: !mcUuid });
  const { data, isLoading } = useGetPlayerTransactionsQuery(
    {
      uuid: mcUuid!,
      type: typeFilter === "ALL" ? undefined : typeFilter,
      limit: TX_PAGE_SIZE,
      offset,
    },
    { skip: !mcUuid }
  );

  if (!mcUuid) return <NeedsMcUuid />;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" label="Loading transactions..." />
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total ?? 0) / TX_PAGE_SIZE);
  const currentPage = Math.floor(offset / TX_PAGE_SIZE) + 1;

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold">QP Transactions</h2>

      {profile && (
        <div className="flex items-baseline gap-6 rounded-lg border border-gray-200 bg-white px-5 py-3">
          <div>
            <p className={`text-2xl font-bold ${profile.qpBalance < 0 ? "text-red-600" : ""}`}>
              {profile.qpBalance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Balance</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-base font-semibold text-green-600">
              +{profile.totalQpEarned.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Earned</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-base font-semibold text-red-600">
              -{profile.totalQpSpent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Spent</p>
          </div>
        </div>
      )}

      <Dropdown
        value={TX_TYPE_LABELS[typeFilter]}
        onOptionSelect={(_, d) => {
          setTypeFilter(d.optionValue as TransactionType | "ALL");
          setOffset(0);
        }}
      >
        {(Object.keys(TX_TYPE_LABELS) as (TransactionType | "ALL")[]).map((t) => (
          <Option key={t} value={t}>
            {TX_TYPE_LABELS[t]}
          </Option>
        ))}
      </Dropdown>

      {!data?.entries.length ? (
        <p className="text-sm text-gray-500 py-4">No transactions found.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="py-2 px-3 text-gray-500 font-medium">Type</th>
                <th className="py-2 px-3 text-gray-500 font-medium">Description</th>
                <th className="py-2 px-3 text-gray-500 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="py-2.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      appearance="tint"
                      color={TX_TYPE_COLORS[tx.type] ?? "informative"}
                      size="small"
                    >
                      {tx.type.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-gray-700 max-w-xs leading-5"><span className="line-clamp-2">{tx.description}</span></td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <Button
                appearance="subtle"
                size="small"
                icon={<ChevronLeftRegular />}
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - TX_PAGE_SIZE))}
              >
                Prev
              </Button>
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                appearance="subtle"
                size="small"
                icon={<ChevronRightRegular />}
                iconPosition="after"
                disabled={offset + TX_PAGE_SIZE >= (data.total ?? 0)}
                onClick={() => setOffset(offset + TX_PAGE_SIZE)}
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

export default function SettingsPage() {
  const { user, isLoggedIn, isAdmin, isAuthor } = useAuth();
  const mcProfile = useMinecraftProfile(user?.mcUuid);
  const [activeTab, setActiveTab] = useState("account");

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>Please log in to access settings.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-7xl mx-auto px-4 py-4">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 pt-6 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Profile
          </p>
          <div className="flex items-center gap-3 mt-3">
            {user.mcUuid && mcProfile.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mcProfile.avatarUrl}
                alt=""
                className="w-8 h-8 rounded [image-rendering:pixelated]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.username}</p>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <Badge appearance="filled" color="danger">
                    Admin
                  </Badge>
                )}
                {!isAdmin && isAuthor && (
                  <Badge appearance="filled" color="brand">
                    Author
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2">
          <TabList
            vertical
            selectedValue={activeTab}
            onTabSelect={(_, d) => setActiveTab(d.value as string)}
            size="large"
            appearance="subtle"
          >
            <Tab value="account" icon={<PersonRegular />}>Account</Tab>
            <Tab value="rankings" icon={<TrophyRegular />}>My Rankings</Tab>
            <Tab value="qp-history" icon={<WalletRegular />}>QP Transactions</Tab>
          </TabList>
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "account" && (
          <AccountSection
            user={user}
            isAdmin={isAdmin}
            isAuthor={isAuthor}
            mcUuid={user.mcUuid}
          />
        )}
        {activeTab === "rankings" && (
          <MyRankingsSection mcUuid={user.mcUuid} />
        )}
        {activeTab === "qp-history" && (
          <QpHistorySection mcUuid={user.mcUuid} />
        )}
      </div>
    </div>
  );
}
