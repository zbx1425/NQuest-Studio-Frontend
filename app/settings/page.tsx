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
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";
import type { TransactionType } from "@/lib/types";

const TX_PAGE_SIZE = 20;
const TX_TYPE_KEYS: Record<TransactionType | "ALL", string> = {
  ALL: "txAllTypes",
  QUEST_COMPLETION: "txQuestCompletion",
  SPEND: "txSpend",
  EARN: "txEarn",
  QP_ADJUSTMENT: "txQpAdjustment",
  DISQUALIFY: "txDisqualify",
  ADMIN_GRANT: "txAdminGrant",
  ADMIN_DEDUCT: "txAdminDeduct",
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
  const t = useTranslations("settings");
  return (
    <div className="py-4">
      <p className="text-sm text-gray-500">
        {t("mcLinkPrompt")}
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
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const dispatch = useDispatch<AppDispatch>();
  const mcProfile = useMinecraftProfile(mcUuid);
  const [bindMc, { isLoading: isBinding }] = useBindMcMutation();
  const [unbindMc, { isLoading: isUnbinding }] = useUnbindMcMutation();
  const [mcToken, setMcToken] = useState("");
  const systemMap = useSelector((state: RootState) => state.systemMap);

  const handleBind = async () => {
    try {
      const result = await bindMc({ token: mcToken }).unwrap();
      toast.success(t("mcLinked"), t("mcLinkedBody", { uuid: result.mcUuid }));
      setMcToken("");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handleUnbind = async () => {
    try {
      await unbindMc().unwrap();
      toast.success(t("mcUnlinked"));
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handleFetchSystemMap = async () => {
    try {
      await dispatch(fetchSystemMap(systemMap.baseUrl)).unwrap();
      toast.success(t("systemMapLoaded"));
    } catch (err) {
      toast.error(t("systemMapFailed"), String(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Discord Account */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("discordAccount")}</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">{user.username}</span>
            {isAdmin && (
              <Badge appearance="filled" color="danger" size="small">{tc("admin")}</Badge>
            )}
            {!isAdmin && isAuthor && (
              <Badge appearance="filled" color="brand" size="small">{tc("author")}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">Discord ID: {user.discordUserId}</p>
        </div>
      </section>

      <Divider />

      {/* Minecraft Account */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("minecraftAccount")}</h2>
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
                  <Badge appearance="outline" color="success" size="small">{tc("linked")}</Badge>
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
              {isUnbinding ? t("unlinking") : t("unlinkAccount")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("mcLinkInstruction", { command: "/idtoken" })}
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <Label htmlFor="mc-token">{t("bindingToken")}</Label>
                <Input
                  id="mc-token"
                  value={mcToken}
                  onChange={(_, d) => setMcToken(d.value)}
                  placeholder={t("bindingTokenPlaceholder")}
                  type="password"
                />
              </div>
              <Button
                appearance="primary"
                icon={<LinkRegular />}
                onClick={handleBind}
                disabled={!mcToken || isBinding}
              >
                {isBinding ? t("linking") : t("link")}
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
            <h2 className="text-lg font-semibold mb-3">{t("systemMapApi")}</h2>
            <p className="text-sm text-gray-600 mb-3">
              {t("systemMapDesc")}
            </p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="sysmap-url">{t("apiBaseUrl")}</Label>
                <Input
                  id="sysmap-url"
                  value={systemMap.baseUrl}
                  onChange={(_, d) => dispatch(setBaseUrl(d.value))}
                  placeholder={t("apiBaseUrlPlaceholder")}
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
                {systemMap.loading ? t("fetching") : t("fetchStationData")}
              </Button>

              {systemMap.error && (
                <MessageBar intent="error">
                  <MessageBarBody>{systemMap.error}</MessageBarBody>
                </MessageBar>
              )}

              {systemMap.data && (
                <p className="text-xs text-gray-500 mt-2">
                  {t("systemMapLoadedBody", {
                    stations: systemMap.data.stationNames.length,
                    routes: systemMap.data.routeNames.length,
                  })}
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
  const t = useTranslations("settings");
  const dateLocale = useDateLocale();
  const { data: profile, isLoading } = useGetPlayerProfileQuery(mcUuid!, {
    skip: !mcUuid,
  });

  if (!mcUuid) return <NeedsMcUuid />;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="medium" label={t("loadingRankings")} />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-gray-500 py-4">
        {t("noRankingData")}
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold">{t("myRankings")}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<TrophyRegular />}
          value={profile.qpBalance.toLocaleString()}
          label={t("qpBalance")}
          iconBg="bg-amber-100 text-amber-600"
          valueClassName={profile.qpBalance < 0 ? "text-red-600" : undefined}
        />
        <StatCard
          icon={<CheckmarkCircleRegular />}
          value={profile.totalQuestCompletions}
          label={t("totalCompletions")}
          iconBg="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<ArrowTrendingRegular />}
          value={profile.personalBestCount}
          label={t("personalBests")}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<CalendarRegular />}
          value={profile.worldRecordCount}
          label={t("worldRecords")}
          iconBg="bg-red-100 text-red-600"
        />
      </div>

      {profile.recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{t("recentActivity")}</h3>
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
                  {formatDistanceToNow(new Date(a.completionTime), { addSuffix: true, locale: dateLocale })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href={`/ranking/player?uuid=${encodeURIComponent(mcUuid)}`}>
        <Button appearance="subtle" icon={<OpenRegular />}>
          {t("viewFullProfile")}
        </Button>
      </Link>
    </div>
  );
}

function QpHistorySection({ mcUuid }: { mcUuid: string | null }) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const dateLocale = useDateLocale();
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
        <Spinner size="medium" label={t("loadingTransactions")} />
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total ?? 0) / TX_PAGE_SIZE);
  const currentPage = Math.floor(offset / TX_PAGE_SIZE) + 1;

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold">{t("qpTransactions")}</h2>

      {profile && (
        <div className="flex items-baseline gap-6 rounded-lg border border-gray-200 bg-white px-5 py-3">
          <div>
            <p className={`text-2xl font-bold ${profile.qpBalance < 0 ? "text-red-600" : ""}`}>
              {profile.qpBalance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{t("balance")}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-base font-semibold text-green-600">
              +{profile.totalQpEarned.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{t("earned")}</p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-base font-semibold text-red-600">
              -{profile.totalQpSpent.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{t("spent")}</p>
          </div>
        </div>
      )}

      <Dropdown
        value={t(TX_TYPE_KEYS[typeFilter])}
        onOptionSelect={(_, d) => {
          setTypeFilter(d.optionValue as TransactionType | "ALL");
          setOffset(0);
        }}
      >
        {(Object.keys(TX_TYPE_KEYS) as (TransactionType | "ALL")[]).map((key) => (
          <Option key={key} value={key}>
            {t(TX_TYPE_KEYS[key])}
          </Option>
        ))}
      </Dropdown>

      {!data?.entries.length ? (
        <p className="text-sm text-gray-500 py-4">{t("noTransactions")}</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3 text-gray-500 font-medium">{t("date")}</th>
                <th className="py-2 px-3 text-gray-500 font-medium">{t("type")}</th>
                <th className="py-2 px-3 text-gray-500 font-medium">{t("description")}</th>
                <th className="py-2 px-3 text-gray-500 font-medium text-right">{tc("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="py-2.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: dateLocale })}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      appearance="tint"
                      color={TX_TYPE_COLORS[tx.type] ?? "informative"}
                      size="small"
                    >
                      {t(TX_TYPE_KEYS[tx.type as TransactionType] ?? tx.type)}
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
                disabled={offset + TX_PAGE_SIZE >= (data.total ?? 0)}
                onClick={() => setOffset(offset + TX_PAGE_SIZE)}
              >
                {tc("next")}
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
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const mcProfile = useMinecraftProfile(user?.mcUuid);
  const [activeTab, setActiveTab] = useState("account");

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>{t("loginRequired")}</MessageBarBody>
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
            {t("myProfile")}
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
                    {tc("admin")}
                  </Badge>
                )}
                {!isAdmin && isAuthor && (
                  <Badge appearance="filled" color="brand">
                    {tc("author")}
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
            <Tab value="account" icon={<PersonRegular />}>{t("account")}</Tab>
            <Tab value="rankings" icon={<TrophyRegular />}>{t("myRankings")}</Tab>
            <Tab value="qp-history" icon={<WalletRegular />}>{t("qpTransactions")}</Tab>
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
