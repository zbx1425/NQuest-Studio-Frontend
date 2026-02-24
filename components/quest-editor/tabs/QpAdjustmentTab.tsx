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
import type { Quest } from "@/lib/types";

interface QpAdjustmentTabProps {
  quest: Quest;
}

export function QpAdjustmentTab({ quest }: QpAdjustmentTabProps) {
  const toast = useAppToast();
  const { isAdmin } = useAuth();
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
            "QP Adjustment Complete",
            `Processed ${result.progress.total} completions.`
          );
          setJobId(null);
          setReason("");
          return;
        }

        if (result.status === "FAILED") {
          toast.error("QP Adjustment Failed", "The adjustment job failed.");
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
        <h2 className="text-lg font-semibold mb-3">QP Adjustment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Retroactively adjust the QP value for this quest. This will update all
          existing completion records and adjust every affected player&apos;s QP
          balance.
        </p>
        {!isAdmin && (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>Permission Notice</MessageBarTitle>
              If any player has completed this quest, contact a staff member
              to perform QP adjustments.
            </MessageBarBody>
          </MessageBar>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1">
          <Label>Current Quest Points</Label>
          <p className="text-2xl font-bold">{quest.questPoints}</p>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="new-qp">New Quest Points</Label>
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
              {delta > 0 ? "+" : ""}{delta} QP per completion
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(_, d) => setReason(d.value)}
            placeholder="Explain why this adjustment is needed..."
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
          Adjust QP for All Completions
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
                ? "Adjustment Complete"
                : jobProgress.status === "FAILED"
                  ? "Adjustment Failed"
                  : "Processing..."}
            </MessageBarTitle>
            <div className="flex items-center gap-2 mt-1">
              {jobProgress.status === "PROCESSING" && <Spinner size="tiny" />}
              <span>
                {jobProgress.processed} / {jobProgress.total} completions
              </span>
            </div>
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={(_, d) => setConfirmOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm QP Adjustment</DialogTitle>
            <DialogContent>
              <p>
                This will change the quest points for <strong>{quest.name}</strong> from{" "}
                <strong>{quest.questPoints}</strong> to <strong>{newQp}</strong>.
              </p>
              <p className="mt-2">
                Every player who has completed this quest will have their QP balance adjusted by{" "}
                <strong className={delta > 0 ? "text-green-600" : "text-red-600"}>
                  {delta > 0 ? "+" : ""}{delta} QP
                </strong>{" "}
                per completion.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Reason: {reason}
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} appearance="secondary">
                Cancel
              </Button>
              <Button onClick={handleSubmit} appearance="primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm Adjustment"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
