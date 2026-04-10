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
  Input,
  RadioGroup,
  Radio,
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { GavelRegular } from "@fluentui/react-icons";
import { useBanPlayerMutation } from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import type { BanType } from "@/lib/types";

interface BanDialogProps {
  playerUuid: string;
  open: boolean;
  onClose: () => void;
}

export function BanDialog({ playerUuid, open, onClose }: BanDialogProps) {
  const [banType, setBanType] = useState<BanType>("TEMP");
  const [reason, setReason] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(1440);
  const [banPlayer, { isLoading }] = useBanPlayerMutation();
  const toast = useAppToast();

  const canSubmit =
    reason.trim().length > 0 &&
    (banType === "PERM" || durationMinutes > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await banPlayer({
        uuid: playerUuid,
        banType,
        reason: reason.trim(),
        ...(banType === "TEMP" ? { durationMinutes } : {}),
      }).unwrap();
      toast.success("Player banned", `${banType === "PERM" ? "Permanent" : `${durationMinutes} minute`} ban applied.`);
      setReason("");
      setBanType("TEMP");
      setDurationMinutes(1440);
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
              <GavelRegular className="text-red-600" />
              Ban Player
            </span>
          </DialogTitle>
          <DialogContent className="space-y-4">
            <MessageBar intent="warning">
              <MessageBarBody>
                This will prevent the player from participating in all quests.
              </MessageBarBody>
            </MessageBar>

            <Field label="Ban Type" required>
              <RadioGroup
                value={banType}
                onChange={(_, data) => setBanType(data.value as BanType)}
                layout="horizontal"
              >
                <Radio value="TEMP" label="Temporary" />
                <Radio value="PERM" label="Permanent" />
              </RadioGroup>
            </Field>

            {banType === "TEMP" && (
              <Field label="Duration (minutes)" required>
                <Input
                  type="number"
                  min={1}
                  value={String(durationMinutes || "")}
                  onChange={(_, data) => {
                    const parsed = parseInt(data.value, 10);
                    setDurationMinutes(Number.isNaN(parsed) ? 0 : parsed);
                  }}
                  contentAfter={
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {durationMinutes >= 1440
                        ? `${(durationMinutes / 1440).toFixed(1)}d`
                        : durationMinutes >= 60
                          ? `${(durationMinutes / 60).toFixed(1)}h`
                          : `${durationMinutes}m`}
                    </span>
                  }
                />
              </Field>
            )}

            <Field label="Reason" required>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder="Describe the reason for this ban..."
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
              disabled={!canSubmit || isLoading}
              style={{
                backgroundColor: "var(--colorPaletteRedBackground3)",
              }}
            >
              {isLoading ? "Banning..." : "Confirm Ban"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
