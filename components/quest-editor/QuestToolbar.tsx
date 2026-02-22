"use client";

import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  MessageBar,
  MessageBarBody,
  Spinner,
  Tooltip,
} from "@fluentui/react-components";
import {
  SaveRegular,
  DeleteRegular,
  ArrowUpRegular,
  ChevronDownRegular,
  MapRegular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  useUpdateQuestStatusMutation,
  usePromoteQuestMutation,
  useDeleteQuestMutation,
} from "@/lib/store/api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Quest } from "@/lib/types";
import type { RootState, AppDispatch } from "@/lib/store";
import { fetchSystemMap } from "@/lib/store/systemMapSlice";

interface QuestToolbarProps {
  quest: Quest | null;
  isNew: boolean;
  isSaving: boolean;
  onSave: () => void;
  canSave: boolean;
  onNavigateToReview?: () => void;
}

export function QuestToolbar({
  quest,
  isNew,
  isSaving,
  onSave,
  canSave,
  onNavigateToReview,
}: QuestToolbarProps) {
  const router = useRouter();
  const toast = useAppToast();
  const dispatch = useDispatch<AppDispatch>();
  const permissions = usePermissions(quest);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);

  const systemMap = useSelector((state: RootState) => state.systemMap);

  const [updateStatus] = useUpdateQuestStatusMutation();
  const [promote] = usePromoteQuestMutation();
  const [deleteQuest, { isLoading: isDeleting }] = useDeleteQuestMutation();

  const handleRefreshSystemMap = async () => {
    if (!systemMap.baseUrl) {
      toast.warning("No System Map URL", "Configure the System Map API URL in Settings first.");
      return;
    }
    try {
      const data = await dispatch(fetchSystemMap(systemMap.baseUrl)).unwrap();
      toast.success("System map refreshed", `${data.stationNames.length} stations, ${data.routeNames.length} routes.`);
    } catch (err) {
      toast.error("Failed to refresh", String(err));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quest) return;
    try {
      await updateStatus({ id: quest.id, status: newStatus }).unwrap();
      toast.success("Status updated", `Quest is now ${newStatus}.`);
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handlePromote = async () => {
    if (!quest) return;
    try {
      await promote(quest.id).unwrap();
      toast.success("Draft promoted", "Draft changes are now live.");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
    setPromoteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!quest) return;
    try {
      await deleteQuest(quest.id).unwrap();
      toast.success("Quest deleted");
      router.replace("/quests");
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
    setDeleteDialogOpen(false);
  };

  const statusOptions = quest
    ? (["PRIVATE", "STAGING", "PUBLIC"] as const).filter(
        (s) => s !== quest.status
      )
    : [];

  return (
    <div className="border-b border-gray-200">
      <Toolbar className="px-4 py-1">
        <ToolbarButton
          appearance="primary"
          icon={isSaving ? <Spinner size="tiny" /> : <SaveRegular />}
          onClick={onSave}
          disabled={!canSave || isSaving}
        >
          {isNew ? "Create" : "Save"}
        </ToolbarButton>

        {!isNew && quest && (
          <>
            <ToolbarDivider />
            <div className="flex items-center gap-2">
              <StatusBadge status={quest.status} />
              {permissions.canChangeStatus && (
                <Menu>
                  <MenuTrigger disableButtonEnhancement>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<ChevronDownRegular />}
                      iconPosition="after"
                    >
                      Change
                    </Button>
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      {statusOptions.map((s) => {
                        const needsAdmin = s === "PUBLIC";
                        const disabled = needsAdmin && !permissions.isAdmin;
                        return (
                          <MenuItem
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            disabled={disabled}
                          >
                            Set to {s}
                            {needsAdmin && !permissions.isAdmin && " (Admin only)"}
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </MenuPopover>
                </Menu>
              )}
            </div>

            {permissions.canPromote && (
              <>
                <ToolbarDivider />
                <ToolbarButton
                  icon={<ArrowUpRegular />}
                  onClick={() => setPromoteDialogOpen(true)}
                >
                  Promote Draft
                </ToolbarButton>
              </>
            )}

            {permissions.canDelete && (
              <>
                <ToolbarDivider />
                <ToolbarButton
                  icon={<DeleteRegular />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </ToolbarButton>
              </>
            )}
          </>
        )}
        
        <ToolbarDivider />
        <Tooltip content={systemMap.data
          ? `${systemMap.data.stationNames.length} stations, ${systemMap.data.routeNames.length} routes loaded`
          : "No station data loaded — click to fetch"} relationship="description">
          <ToolbarButton
            icon={systemMap.loading ? <Spinner size="tiny" /> : <MapRegular />}
            onClick={handleRefreshSystemMap}
            disabled={systemMap.loading}
          >
            {systemMap.data ? "Reload MTR Data" : "Load MTR Data"}
          </ToolbarButton>
        </Tooltip>
      </Toolbar>

      {quest?.hasPendingDraft && quest.status === "PUBLIC" && (
        <MessageBar intent="warning" className="rounded-none">
          <MessageBarBody className="flex items-center gap-2 flex-wrap">
            <span>
              {permissions.isAdmin
                ? "This quest has pending draft changes. You can review and promote them to make them live."
                : "This quest has pending game logic changes awaiting admin review. Metadata changes are already live."}
            </span>
            {quest.dataPublic && onNavigateToReview && (
              <Button
                appearance="transparent"
                size="small"
                onClick={onNavigateToReview}
                style={{ minWidth: 0, textDecoration: "underline" }}
              >
                Review Changes
              </Button>
            )}
          </MessageBarBody>
        </MessageBar>
      )}

      <Dialog open={promoteDialogOpen} onOpenChange={(_, d) => setPromoteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Promote Draft to Live</DialogTitle>
            <DialogContent>
              Are you sure you want to promote the draft changes to the live
              version? This will make the draft game logic immediately available
              to all players.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPromoteDialogOpen(false)} appearance="secondary">
                Cancel
              </Button>
              <Button onClick={handlePromote} appearance="primary">
                Promote to Live
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={(_, d) => setDeleteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Quest</DialogTitle>
            <DialogContent>
              Are you sure you want to delete <strong>{quest?.name}</strong> ({quest?.id})? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} appearance="secondary">
                Cancel
              </Button>
              <Button onClick={handleDelete} appearance="primary" disabled={isDeleting}
                style={{ backgroundColor: "var(--colorPaletteRedBackground3)" }}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
