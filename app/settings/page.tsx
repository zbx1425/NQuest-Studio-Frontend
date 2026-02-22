"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Input,
  Label,
  Badge,
  Spinner,
  MessageBar,
  MessageBarBody,
  Divider,
} from "@fluentui/react-components";
import {
  LinkRegular,
  LinkDismissRegular,
  ArrowDownloadRegular,
} from "@fluentui/react-icons";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBindMcMutation, useUnbindMcMutation } from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import type { RootState, AppDispatch } from "@/lib/store";
import { setBaseUrl, fetchSystemMap } from "@/lib/store/systemMapSlice";
import { useMinecraftProfile } from "@/lib/hooks/useMinecraftProfile";

export default function SettingsPage() {
  const { user, isLoggedIn, isAdmin, isAuthor } = useAuth();
  const toast = useAppToast();
  const dispatch = useDispatch<AppDispatch>();

  const systemMap = useSelector((state: RootState) => state.systemMap);

  const [bindMc, { isLoading: isBinding }] = useBindMcMutation();
  const [unbindMc, { isLoading: isUnbinding }] = useUnbindMcMutation();
  const mcProfile = useMinecraftProfile(user?.mcUuid);

  const [mcToken, setMcToken] = useState("");

  if (!isLoggedIn || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>Please log in to access settings.</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Info */}
      <section>
        <h2 className="text-lg font-semibold mb-3">User Information</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{user.username}</span>
            {isAdmin && (
              <Badge appearance="filled" color="danger" size="small">
                Admin
              </Badge>
            )}
            {!isAdmin && isAuthor && (
              <Badge appearance="filled" color="brand" size="small">
                Author
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Discord ID: {user.discordUserId}
          </p>
        </div>
      </section>

      <Divider />

      {/* MC UUID Binding */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Minecraft Account</h2>
        {user.mcUuid ? (
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
                  <Badge appearance="outline" color="success" size="small">
                    Linked
                  </Badge>
                  {mcProfile.loading ? (
                    <Spinner size="tiny" />
                  ) : mcProfile.username ? (
                    <span className="font-semibold">{mcProfile.username}</span>
                  ) : null}
                </div>
                <p className="font-mono text-xs text-gray-500 truncate">
                  {user.mcUuid}
                </p>
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
              <code className="bg-gray-100 px-1 rounded">/idtoken</code> on
              the Minecraft server to get a token, then paste it below.
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

      <Divider />

      {/* System Map API */}
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
              systemMap.loading ? (
                <Spinner size="tiny" />
              ) : (
                <ArrowDownloadRegular />
              )
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
    </div>
  );
}
