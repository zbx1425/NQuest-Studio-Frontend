"use client";

import { useState, useCallback } from "react";
import {
  TabList,
  Tab,
  Input,
  Button,
  Spinner,
} from "@fluentui/react-components";
import {
  SearchRegular,
  PersonRegular,
  NumberSymbolRegular,
} from "@fluentui/react-icons";
import {
  useLazySearchUsersQuery,
  useLazySearchAdminPlayersQuery,
} from "@/lib/store/api";
import type { UserRef, PlayerSearchResult } from "@/lib/types";

export interface ResolvedPlayer {
  uuid: string;
  name?: string;
  source: "uuid" | "adminSearch" | "discord";
  discordInfo?: UserRef;
}

interface IdentitySearchPanelProps {
  onResolve: (player: ResolvedPlayer) => void;
}

const UUID_RE =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function formatUuid(hex: string): string {
  const h = hex.replace(/-/g, "");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function IdentitySearchPanel({ onResolve }: IdentitySearchPanelProps) {
  const [mode, setMode] = useState<"mc" | "uuid" | "discord">("mc");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mcResults, setMcResults] = useState<PlayerSearchResult[]>([]);
  const [discordResults, setDiscordResults] = useState<UserRef[]>([]);

  const [searchAdminPlayers] = useLazySearchAdminPlayersQuery();
  const [searchUsers] = useLazySearchUsersQuery();

  const handleMcSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setMcResults([]);

    try {
      const result = await searchAdminPlayers({
        name: query.trim(),
        limit: 10,
      }).unwrap();

      if (result.results.length > 0) {
        setMcResults(result.results);
      } else {
        setError("Player not found in system records.");
      }
    } catch {
      setError("Search failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [query, searchAdminPlayers]);

  const handleUuidSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!UUID_RE.test(trimmed)) {
      setError("Invalid UUID format.");
      return;
    }
    setError(null);
    onResolve({ uuid: formatUuid(trimmed), source: "uuid" });
  }, [query, onResolve]);

  const handleDiscordSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setDiscordResults([]);

    try {
      const result = await searchUsers({
        q: query.trim(),
        limit: 10,
      }).unwrap();
      if (result.length === 0) {
        setError("No Discord users found.");
      } else {
        setDiscordResults(result);
      }
    } catch {
      setError("Discord user search failed.");
    } finally {
      setLoading(false);
    }
  }, [query, searchUsers]);

  const handleSubmit = () => {
    if (mode === "mc") handleMcSearch();
    else if (mode === "uuid") handleUuidSubmit();
    else handleDiscordSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const selectMcResult = (r: PlayerSearchResult) => {
    setMcResults([]);
    onResolve({ uuid: r.playerUuid, name: r.playerName, source: "adminSearch" });
  };

  const selectDiscordResult = (r: UserRef) => {
    setDiscordResults([]);
    onResolve({
      uuid: "",
      name: r.username,
      source: "discord",
      discordInfo: r,
    });
  };

  const placeholders: Record<string, string> = {
    mc: "Enter Minecraft username...",
    uuid: "Enter player UUID (with or without dashes)...",
    discord: "Search by Discord username...",
  };

  const icons: Record<string, React.ReactElement> = {
    mc: <PersonRegular />,
    uuid: <NumberSymbolRegular />,
    discord: <SearchRegular />,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-100 px-4 pt-3">
        <TabList
          selectedValue={mode}
          onTabSelect={(_, data) => {
            setMode(data.value as "mc" | "uuid" | "discord");
            setError(null);
            setMcResults([]);
            setDiscordResults([]);
          }}
          size="small"
        >
          <Tab value="mc" icon={<PersonRegular />}>
            MC Username
          </Tab>
          <Tab value="uuid" icon={<NumberSymbolRegular />}>
            UUID
          </Tab>
          <Tab value="discord" icon={<SearchRegular />}>
            Discord
          </Tab>
        </TabList>
      </div>

      <div className="p-4">
        <div className="flex gap-2">
          <Input
            className="flex-1"
            value={query}
            onChange={(_, data) => setQuery(data.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[mode]}
            contentBefore={icons[mode]}
            disabled={loading}
          />
          <Button
            appearance="primary"
            onClick={handleSubmit}
            disabled={loading || !query.trim()}
            icon={loading ? <Spinner size="tiny" /> : <SearchRegular />}
          >
            {mode === "uuid" ? "Use" : "Search"}
          </Button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {mcResults.length > 0 && (
          <div className="mt-3 rounded-lg border border-gray-100 divide-y divide-gray-100">
            {mcResults.map((r) => (
              <button
                key={r.playerUuid}
                onClick={() => selectMcResult(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc-heads.net/avatar/${r.playerUuid}/24`}
                  alt=""
                  className="w-6 h-6 rounded"
                />
                <span className="font-medium text-sm">{r.playerName}</span>
                <span className="text-xs text-gray-400 font-mono ml-auto">
                  {r.playerUuid}
                </span>
              </button>
            ))}
          </div>
        )}

        {discordResults.length > 0 && (
          <div className="mt-3 rounded-lg border border-gray-100 divide-y divide-gray-100">
            {discordResults.map((r) => (
              <button
                key={r.discordUserId}
                onClick={() => selectDiscordResult(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">{r.username}</span>
                <span className="text-xs text-gray-400 font-mono ml-auto">
                  {r.discordUserId}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
