"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Input,
  Textarea,
  Label,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { useAdjustQuestQpMutation, useLazyGetJobStatusQuery } from "@/lib/store/api";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTranslations } from "next-intl";
import type { Quest } from "@/lib/types";

interface QpAdjustmentTabProps {
  quest: Quest;
}

export function QpAdjustmentTab({ quest }: QpAdjustmentTabProps) {
  const toast = useAppToast();
  const { isAdmin } = useAuth();
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const tr = useTranslations("ranking");
  const [newQp, setNewQp] = useState(quest.questPoints);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [adjustQp, { isLoading: isSubmitting }] = useAdjustQuestQpMutation();
  const [triggerJobStatus] = useLazyGetJobStatusQuery();

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<{
    processed: number;
    total: number;
    status: string;
  } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pollJob = useCallback(
    async (id: string) => {
      try {
        const result = await triggerJobStatus(id).unwrap();
        setJobProgress({
          processed: result.progress.processed,
          total: result.progress.total,
          status: result.status,
        });

        if (result.status === "COMPLETED") {
          toast.success(
            t("qpAdjustmentComplete"),
            t("qpAdjustmentCompleteBody", { total: result.progress.total })
          );
          setJobId(null);
          setReason("");
          return;
        }

        if (result.status === "FAILED") {
          toast.error(t("qpAdjustmentFailed"), t("qpAdjustmentFailedBody"));
          setJobId(null);
          return;
        }

        pollingRef.current = setTimeout(() => pollJob(id), 2000);
      } catch {
        pollingRef.current = setTimeout(() => pollJob(id), 5000);
      }
    },
    [triggerJobStatus, toast]
  );

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const handleSubmit = async () => {
    setConfirmOpen(false);
    try {
      const result = await adjustQp({
        questId: quest.id,
        newQuestPoints: newQp,
        reason,
      }).unwrap();

      setJobId(result.jobId);
      setJobProgress({
        processed: 0,
        total: result.affectedCompletions,
        status: "PROCESSING",
      });

      pollJob(result.jobId);
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const delta = newQp - quest.questPoints;

  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("qpAdjustmentTitle")}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t("qpAdjustmentDesc")}
        </p>
        {!isAdmin && (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>{t("permissionNotice")}</MessageBarTitle>
              {t("permissionNoticeBody")}
            </MessageBarBody>
          </MessageBar>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label>{t("currentQuestPoints")}</Label>
          <p className="text-2xl font-bold">{quest.questPoints}</p>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="new-qp">{t("newQuestPoints")}</Label>
          <Input
            id="new-qp"
            type="number"
            value={String(newQp)}
            onChange={(_, d) => {
              const v = parseInt(d.value, 10);
              setNewQp(isNaN(v) ? 0 : v);
            }}
            min={0}
            disabled={!!jobId}
          />
          {delta !== 0 && (
            <p className={`text-sm font-semibold ${delta > 0 ? "text-green-600" : "text-red-600"}`}>
              {t("deltaPerCompletion", { delta: `${delta > 0 ? "+" : ""}${delta}` })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="reason">{tr("reason")}</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(_, d) => setReason(d.value)}
            placeholder={t("reasonPlaceholder")}
            resize="vertical"
            rows={3}
            disabled={!!jobId}
          />
        </div>

        <Button
          appearance="primary"
          onClick={() => setConfirmOpen(true)}
          disabled={delta === 0 || !reason.trim() || isSubmitting || !!jobId}
        >
          {t("adjustForAll")}
        </Button>
      </section>

      {/* Job progress */}
      {jobId && jobProgress && (
        <MessageBar
          intent={
            jobProgress.status === "COMPLETED"
              ? "success"
              : jobProgress.status === "FAILED"
                ? "error"
                : "info"
          }
        >
          <MessageBarBody>
            <MessageBarTitle>
              {jobProgress.status === "COMPLETED"
                ? t("adjustmentComplete")
                : jobProgress.status === "FAILED"
                  ? t("adjustmentFailed")
                  : t("processing")}
            </MessageBarTitle>
            <div className="flex items-center gap-2 mt-1">
              {jobProgress.status === "PROCESSING" && <Spinner size="tiny" />}
              <span>
                {t("completionProgress", { processed: jobProgress.processed, total: jobProgress.total })}
              </span>
            </div>
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={(_, d) => setConfirmOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("confirmQpAdjustment")}</DialogTitle>
            <DialogContent>
              <p>
                {t("confirmQpAdjustmentText", {
                  name: quest.name,
                  from: quest.questPoints,
                  to: newQp,
                })}
              </p>
              <p className="mt-2">
                {t("confirmQpAdjustmentDelta", {
                  delta: `${delta > 0 ? "+" : ""}${delta}`,
                })}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {t("confirmReason", { reason })}
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} appearance="secondary">
                {tc("cancel")}
              </Button>
              <Button onClick={handleSubmit} appearance="primary" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : t("confirmAdjustment")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
