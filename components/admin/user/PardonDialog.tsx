"use client";

import { useState } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Field,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { ShieldCheckmarkRegular } from "@fluentui/react-icons";
import { usePardonPlayerMutation } from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";

interface PardonDialogProps {
  playerUuid: string;
  activeBanCount: number;
  open: boolean;
  onClose: () => void;
}

export function PardonDialog({
  playerUuid,
  activeBanCount,
  open,
  onClose,
}: PardonDialogProps) {
  const [reason, setReason] = useState("");
  const [pardonPlayer, { isLoading }] = usePardonPlayerMutation();
  const toast = useAppToast();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      const result = await pardonPlayer({
        uuid: playerUuid,
        reason: reason.trim(),
      }).unwrap();
      toast.success(
        "Player pardoned",
        `${result.pardonedCount} ban(s) have been lifted.`
      );
      setReason("");
      onClose();
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ShieldCheckmarkRegular className="text-green-600" />
              Pardon Player
            </span>
          </DialogTitle>
          <DialogContent className="space-y-4">
            <MessageBar intent="info">
              <MessageBarBody>
                This will lift all {activeBanCount} active ban(s) for this
                player.
              </MessageBarBody>
            </MessageBar>

            <Field label="Pardon Reason" required>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder="Describe the reason for this pardon..."
                resize="vertical"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? "Pardoning..." : "Confirm Pardon"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
