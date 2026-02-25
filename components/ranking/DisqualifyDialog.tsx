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
} from "@fluentui/react-components";
import { ShieldDismissRegular } from "@fluentui/react-icons";
import { useDisqualifyCompletionMutation } from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { useTranslations } from "next-intl";

interface DisqualifyDialogProps {
  completionId: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DisqualifyDialog({
  completionId,
  open,
  onClose,
  onSuccess,
}: DisqualifyDialogProps) {
  const [reason, setReason] = useState("");
  const [disqualify, { isLoading }] = useDisqualifyCompletionMutation();
  const toast = useAppToast();
  const t = useTranslations("ranking");
  const tc = useTranslations("common");

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      const result = await disqualify({
        completionId,
        reason: reason.trim(),
      }).unwrap();
      toast.success(
        t("completionDisqualified"),
        t("disqualifiedBody", { qpDeducted: result.qpDeducted, newBalance: result.newBalance })
      );
      setReason("");
      onClose();
      onSuccess?.();
    } catch (err) {
      const { title, body } = extractApiError(err);
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        (err as { status: number }).status === 409
      ) {
        toast.warning(t("alreadyDisqualified"), body);
      } else {
        toast.error(title, body);
      }
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
              <ShieldDismissRegular className="text-red-600" />
              {t("disqualifyTitle", { id: completionId })}
            </span>
          </DialogTitle>
          <DialogContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("disqualifyDesc")}
            </p>
            <Field label={t("reason")} required>
              <Textarea
                value={reason}
                onChange={(_, data) => setReason(data.value)}
                placeholder={t("disqualifyPlaceholder")}
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
              disabled={!reason.trim() || isLoading}
              style={{ backgroundColor: "var(--colorPaletteRedBackground3)" }}
            >
              {isLoading ? t("disqualifying") : t("disqualify")}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
