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
} from "@fluentui/react-components";
import {
  ArrowUpRegular,
  ArrowDownRegular,
} from "@fluentui/react-icons";
import {
  useAdminGrantQpMutation,
  useAdminDeductQpMutation,
} from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { useTranslations } from "next-intl";

interface QpGrantDeductDialogProps {
  playerUuid: string;
  playerName: string;
  mode: "grant" | "deduct";
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QpGrantDeductDialog({
  playerUuid,
  playerName,
  mode,
  open,
  onClose,
  onSuccess,
}: QpGrantDeductDialogProps) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [grantQp, { isLoading: granting }] = useAdminGrantQpMutation();
  const [deductQp, { isLoading: deducting }] = useAdminDeductQpMutation();
  const toast = useAppToast();
  const t = useTranslations("ranking");
  const tc = useTranslations("common");
  const isLoading = granting || deducting;
  const isGrant = mode === "grant";

  const handleSubmit = async () => {
    if (amount <= 0 || !reason.trim()) return;
    try {
      const mutate = isGrant ? grantQp : deductQp;
      const result = await mutate({
        uuid: playerUuid,
        amount,
        reason: reason.trim(),
      }).unwrap();
      toast.success(
        isGrant ? t("qpGranted") : t("qpDeducted"),
        isGrant
          ? t("qpGrantBody", { amount, playerName, newBalance: result.newBalance })
          : t("qpDeductBody", { amount, playerName, newBalance: result.newBalance })
      );
      setAmount(0);
      setReason("");
      onClose();
      onSuccess?.();
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
              {isGrant ? (
                <ArrowUpRegular className="text-green-600" />
              ) : (
                <ArrowDownRegular className="text-red-600" />
              )}
              {isGrant ? t("qpGrantTitle", { playerName }) : t("qpDeductTitle", { playerName })}
            </span>
          </DialogTitle>
          <DialogContent className="space-y-3">
            <Field label={tc("amount")} required>
              <Input
                type="number"
                min={1}
                value={String(amount || "")}
                onChange={(_, data) => {
                  const parsed = parseInt(data.value, 10);
                  setAmount(Number.isNaN(parsed) ? 0 : parsed);
                }}
              />
            </Field>
            <Field label={t("reason")} required>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder={
                  isGrant
                    ? t("grantPlaceholder")
                    : t("deductPlaceholder")
                }
                resize="vertical"
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
              {tc("cancel")}
            </Button>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={amount <= 0 || !reason.trim() || isLoading}
            >
              {isLoading
                ? isGrant
                  ? t("granting")
                  : t("deducting")
                : isGrant
                  ? t("grantAmountQp", { amount })
                  : t("deductAmountQp", { amount })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
