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
  WarningRegular,
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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const permissions = usePermissions(quest);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);

  const systemMap = useSelector((state: RootState) => state.systemMap);
  const needsMtrData = !systemMap.data && !systemMap.loading;

  const [updateStatus] = useUpdateQuestStatusMutation();
  const [promote] = usePromoteQuestMutation();
  const [deleteQuest, { isLoading: isDeleting }] = useDeleteQuestMutation();

  const handleRefreshSystemMap = async () => {
    if (!systemMap.baseUrl) {
      toast.warning(t("noSystemMapUrl"), t("noSystemMapUrlBody"));
      return;
    }
    try {
      const data = await dispatch(fetchSystemMap(systemMap.baseUrl)).unwrap();
      toast.success(t("systemMapRefreshed"), t("systemMapRefreshedBody", { stations: data.stationNames.length, routes: data.routeNames.length }));
    } catch (err) {
      toast.error(t("failedToRefresh"), String(err));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!quest) return;
    try {
      await updateStatus({ id: quest.id, status: newStatus }).unwrap();
      toast.success(t("statusUpdated"), t("statusUpdatedBody", { status: newStatus }));
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const handlePromote = async () => {
    if (!quest) return;
    try {
      await promote(quest.id).unwrap();
      toast.success(t("draftPromoted"), t("draftPromotedBody"));
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
      toast.success(t("questDeleted"));
      router.replace("/author/quests");
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
          {isNew ? t("create") : tc("save")}
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
                      {t("change")}
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
                            {t("setTo", { status: s })}
                            {needsAdmin && !permissions.isAdmin && t("adminOnly")}
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
                  {t("promoteDraft")}
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
                  {tc("delete")}
                </ToolbarButton>
              </>
            )}
          </>
        )}
        
        <ToolbarDivider />
        <div
          className={
            needsMtrData
              ? "flex shrink-0 items-center gap-2 rounded-md border border-amber-400/80 bg-amber-50 ps-2 pe-0.5 py-0.5 shadow-sm ring-1 ring-amber-300/50 dark:border-amber-500/55 dark:bg-amber-950/45 dark:ring-amber-600/40"
              : "contents"
          }
        >
          {needsMtrData && (
            <WarningRegular
              className="shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden
              style={{ fontSize: 18 }}
            />
          )}
          <Tooltip
            content={
              systemMap.data
                ? t("mtrDataTooltip", {
                    stations: systemMap.data.stationNames.length,
                    routes: systemMap.data.routeNames.length,
                  })
                : t("mtrNoDataTooltip")
            }
            relationship="description"
          >
            <ToolbarButton
              appearance={needsMtrData ? "primary" : "subtle"}
              icon={systemMap.loading ? <Spinner size="tiny" /> : <MapRegular />}
              onClick={handleRefreshSystemMap}
              disabled={systemMap.loading}
            >
              {systemMap.data ? t("reloadMtrData") : t("loadMtrData")}
            </ToolbarButton>
          </Tooltip>
        </div>
      </Toolbar>

      {quest?.hasPendingDraft && quest.status === "PUBLIC" && (
        <MessageBar intent="warning" className="rounded-none">
          <MessageBarBody className="flex items-center gap-2 flex-wrap">
            <span>
              {permissions.isAdmin
                ? t("pendingDraftAdmin")
                : t("pendingDraftAuthor")}
            </span>
            {quest.dataPublic && onNavigateToReview && (
              <Button
                appearance="transparent"
                size="small"
                onClick={onNavigateToReview}
                style={{ minWidth: 0, textDecoration: "underline" }}
              >
                {t("reviewChanges")}
              </Button>
            )}
          </MessageBarBody>
        </MessageBar>
      )}

      <Dialog open={promoteDialogOpen} onOpenChange={(_, d) => setPromoteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("promoteDraftToLive")}</DialogTitle>
            <DialogContent>
              {t("promoteConfirmText")}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPromoteDialogOpen(false)} appearance="secondary">
                {tc("cancel")}
              </Button>
              <Button onClick={handlePromote} appearance="primary">
                {t("promoteToLive")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={(_, d) => setDeleteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("deleteQuest")}</DialogTitle>
            <DialogContent>
              {t("deleteConfirmText", { name: quest?.name ?? "", id: quest?.id ?? "" })}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} appearance="secondary">
                {tc("cancel")}
              </Button>
              <Button onClick={handleDelete} appearance="primary" disabled={isDeleting}
                style={{ backgroundColor: "var(--colorPaletteRedBackground3)" }}>
                {isDeleting ? t("deleting") : tc("delete")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
