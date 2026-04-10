"use client";

import { useState, useCallback } from "react";
import {
  Tab,
  TabList,
  Button,
  Badge,
  Tooltip,
  MessageBar,
  MessageBarBody,
  Input,
} from "@fluentui/react-components";
import {
  ListRegular,
  SearchRegular,
  GavelRegular,
  ShieldCheckmarkRegular,
  CopyRegular,
  CheckmarkRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  useGetPlayerBansQuery,
  useGetAdminBansQuery,
} from "@/lib/store/api";
import {
  IdentitySearchPanel,
  type ResolvedPlayer,
} from "@/components/admin/user/IdentitySearchPanel";
import { BanDialog } from "@/components/admin/user/BanDialog";
import { PardonDialog } from "@/components/admin/user/PardonDialog";
import { BanHistoryTable } from "@/components/admin/user/BanHistoryTable";
import { InfractionsTimeline } from "@/components/admin/user/InfractionsTimeline";

const ACTIVE_BANS_PAGE_SIZE = 20;

export default function AdminUserPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"active-bans" | "inspect-player">(
    "active-bans"
  );
  const [resolvedPlayer, setResolvedPlayer] = useState<ResolvedPlayer | null>(
    null
  );
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [pardonDialogOpen, setPardonDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualUuid, setManualUuid] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeOffset, setActiveOffset] = useState(0);

  const playerUuid =
    resolvedPlayer?.source === "discord"
      ? manualUuid.trim() || null
      : resolvedPlayer?.uuid || null;

  const { data: activeBansData } = useGetPlayerBansQuery(
    { uuid: playerUuid!, active: true, limit: 100 },
    { skip: !playerUuid }
  );
  const activeBanCount = activeBansData?.entries.length ?? 0;

  const { data: activeBanListData, isLoading: activeBanListLoading } =
    useGetAdminBansQuery({
      search: activeSearch.trim() || undefined,
      limit: ACTIVE_BANS_PAGE_SIZE,
      offset: activeOffset,
    });

  const handleResolve = useCallback((player: ResolvedPlayer) => {
    setResolvedPlayer(player);
    setManualUuid("");
    setCopied(false);
  }, []);

  const handleSelectFromList = (uuid: string, name: string | null) => {
    setResolvedPlayer({
      uuid,
      name: name ?? undefined,
      source: "adminSearch",
    });
    setManualUuid("");
    setCopied(false);
    setActiveTab("inspect-player");
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>Admin only page.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  const activeEntries = activeBanListData?.entries ?? [];
  const activeTotal = activeBanListData?.total ?? 0;
  const activePage = Math.floor(activeOffset / ACTIVE_BANS_PAGE_SIZE) + 1;
  const activeTotalPages = Math.max(
    1,
    Math.ceil(activeTotal / ACTIVE_BANS_PAGE_SIZE)
  );

  return (
    <div className="flex h-full max-w-7xl mx-auto px-4 py-4">
      <aside className="w-56 shrink-0 border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 pt-6 pb-4">
          <p className="font-semibold mt-2">Ban Management</p>
        </div>
        <nav className="flex-1 px-2">
          <TabList
            vertical
            selectedValue={activeTab}
            onTabSelect={(_, d) =>
              setActiveTab(d.value as "active-bans" | "inspect-player")
            }
            size="large"
            appearance="subtle"
          >
            <Tab value="active-bans" icon={<ListRegular />}>
              Active Bans
            </Tab>
            <Tab value="inspect-player" icon={<SearchRegular />}>
              Inspect Player
            </Tab>
          </TabList>
        </nav>
      </aside>

      <div className="flex-1 min-w-0 min-h-0 overflow-auto p-6">
        {activeTab === "active-bans" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                className="max-w-full! w-64!"
                value={activeSearch}
                onChange={(_, data) => {
                  setActiveSearch(data.value);
                  setActiveOffset(0);
                }}
                placeholder="Search by player name or UUID"
                contentBefore={<SearchRegular />}
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/60">
                    <th className="text-left p-3 font-semibold">Player</th>
                    <th className="text-left p-3 font-semibold">UUID</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Reason</th>
                    <th className="text-left p-3 font-semibold">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBanListLoading && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        Loading active bans...
                      </td>
                    </tr>
                  )}
                  {!activeBanListLoading && activeEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No active bans found.
                      </td>
                    </tr>
                  )}
                  {!activeBanListLoading &&
                    activeEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          handleSelectFromList(entry.playerUuid, entry.playerName)
                        }
                      >
                        <td className="p-3 font-medium">
                          {entry.playerName ?? "(unknown)"}
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-500">
                          {entry.playerUuid}
                        </td>
                        <td className="p-3">
                          <Badge
                            appearance="outline"
                            color={
                              entry.banType === "PERM" ? "danger" : "warning"
                            }
                            size="small"
                          >
                            {entry.banType}
                          </Badge>
                        </td>
                        <td className="p-3 max-w-xs truncate">{entry.reason}</td>
                        <td className="p-3 text-xs text-gray-600">
                          {entry.expiresAt
                            ? new Date(entry.expiresAt).toLocaleString()
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <Button
                appearance="subtle"
                icon={<ChevronLeftRegular />}
                disabled={activeOffset === 0}
                onClick={() =>
                  setActiveOffset(Math.max(0, activeOffset - ACTIVE_BANS_PAGE_SIZE))
                }
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {activePage} of {activeTotalPages}
              </span>
              <Button
                appearance="subtle"
                icon={<ChevronRightRegular />}
                iconPosition="after"
                disabled={activeOffset + ACTIVE_BANS_PAGE_SIZE >= activeTotal}
                onClick={() => setActiveOffset(activeOffset + ACTIVE_BANS_PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {activeTab === "inspect-player" && (
          <div className="space-y-6">
            <IdentitySearchPanel onResolve={handleResolve} />

            {resolvedPlayer?.source === "discord" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge appearance="filled" color="brand" size="small">
                    Discord
                  </Badge>
                  <span className="font-medium text-sm">
                    {resolvedPlayer.discordInfo?.username}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {resolvedPlayer.discordInfo?.discordUserId}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Enter this player&apos;s Minecraft UUID to manage bans.
                </p>
                <Input
                  className="max-w-md"
                  value={manualUuid}
                  onChange={(_, data) => setManualUuid(data.value)}
                  placeholder="Enter Minecraft UUID..."
                  contentBefore={<SearchRegular />}
                />
              </div>
            )}

            {playerUuid && (
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://mc-heads.net/avatar/${playerUuid}/40`}
                        alt=""
                        className="w-10 h-10 rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        {resolvedPlayer?.name && (
                          <p className="font-semibold text-lg leading-tight truncate">
                            {resolvedPlayer.name}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Tooltip content="Click to copy" relationship="label">
                            <button
                              onClick={() => handleCopy(playerUuid)}
                              className="font-mono text-xs text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1"
                            >
                              {playerUuid}
                              {copied ? (
                                <CheckmarkRegular className="text-green-500" />
                              ) : (
                                <CopyRegular />
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {activeBanCount > 0 && (
                        <Badge appearance="filled" color="danger" size="medium">
                          {activeBanCount} active ban
                          {activeBanCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      appearance="primary"
                      icon={<GavelRegular />}
                      onClick={() => setBanDialogOpen(true)}
                      style={{
                        backgroundColor: "var(--colorPaletteRedBackground3)",
                      }}
                    >
                      Ban Player
                    </Button>
                    <Button
                      appearance="primary"
                      icon={<ShieldCheckmarkRegular />}
                      onClick={() => setPardonDialogOpen(true)}
                      disabled={activeBanCount === 0}
                    >
                      Pardon All Active Bans
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <InfractionsTimeline playerUuid={playerUuid} />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <BanHistoryTable playerUuid={playerUuid} />
                </div>
              </div>
            )}

            {!playerUuid && !resolvedPlayer && (
              <div className="text-center text-gray-400 py-10">
                Search for a player to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {playerUuid && (
        <>
          <BanDialog
            playerUuid={playerUuid}
            open={banDialogOpen}
            onClose={() => setBanDialogOpen(false)}
          />
          <PardonDialog
            playerUuid={playerUuid}
            activeBanCount={activeBanCount}
            open={pardonDialogOpen}
            onClose={() => setPardonDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
}
