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
  Badge,
  Spinner,
} from "@fluentui/react-components";
import {
  SaveRegular,
  DeleteRegular,
  ArrowUpRegular,
  ChevronDownRegular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateQuestStatusMutation,
  usePromoteQuestMutation,
  useDeleteQuestMutation,
} from "@/lib/store/api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Quest } from "@/lib/types";

interface QuestToolbarProps {
  quest: Quest | null;
  isNew: boolean;
  isSaving: boolean;
  onSave: () => void;
  canSave: boolean;
}

export function QuestToolbar({
  quest,
  isNew,
  isSaving,
  onSave,
  canSave,
}: QuestToolbarProps) {
  const router = useRouter();
  const toast = useAppToast();
  const permissions = usePermissions(quest);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [updateStatus] = useUpdateQuestStatusMutation();
  const [promote] = usePromoteQuestMutation();
  const [deleteQuest, { isLoading: isDeleting }] = useDeleteQuestMutation();

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
  };

  const handleDelete = async () => {
    if (!quest) return;
    try {
      await deleteQuest(quest.id).unwrap();
      toast.success("Quest deleted");
      router.replace("/");
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
    <div className="border-b">
      <Toolbar size="small" className="px-4 py-1">
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
                  onClick={handlePromote}
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
      </Toolbar>

      {quest?.hasPendingDraft && quest.status === "PUBLIC" && (
        <MessageBar intent="warning" className="rounded-none">
          <MessageBarBody>
            This quest has pending draft changes that differ from the live
            version.{" "}
            {permissions.isAdmin
              ? "You can promote the draft to make it live."
              : "An admin needs to approve the changes."}
          </MessageBarBody>
        </MessageBar>
      )}

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
