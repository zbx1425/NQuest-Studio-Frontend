"use client";

import { useMemo } from "react";
import {
  Button,
  Text,
  MessageBar,
  MessageBarBody,
  Badge,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import { ArrowUpRegular } from "@fluentui/react-icons";
import { diffLines, type Change } from "diff";
import { usePromoteQuestMutation } from "@/lib/store/api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { useTranslations } from "next-intl";
import type { Quest } from "@/lib/types";
import { useState } from "react";

interface ReviewTabProps {
  quest: Quest;
}

export function ReviewTab({ quest }: ReviewTabProps) {
  const toast = useAppToast();
  const permissions = usePermissions(quest);
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const [promote, { isLoading: isPromoting }] = usePromoteQuestMutation();
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);

  const { changes, stats } = useMemo(() => {
    const liveJson = JSON.stringify(quest.dataPublic ?? null, null, 2);
    const draftJson = JSON.stringify(quest.dataDraft, null, 2);
    const diff = diffLines(liveJson, draftJson);

    let added = 0;
    let removed = 0;
    for (const part of diff) {
      const count = part.count ?? 0;
      if (part.added) added += count;
      else if (part.removed) removed += count;
    }
    return { changes: diff, stats: { added, removed } };
  }, [quest.dataPublic, quest.dataDraft]);

  const handlePromote = async () => {
    try {
      await promote(quest.id).unwrap();
      toast.success(t("draftPromoted"), t("draftPromotedBody"));
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
    setPromoteDialogOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">{t("reviewTitle")}</h2>
        <Text size={200} className="text-gray-500">
          {t("reviewDesc")}
        </Text>
      </div>

      {stats.added === 0 && stats.removed === 0 ? (
        <MessageBar intent="success">
          <MessageBarBody>
            {t("noDiffChanges")}
          </MessageBarBody>
        </MessageBar>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Badge appearance="filled" color="success" size="small">
              {t("addedLines", { count: stats.added })}
            </Badge>
            <Badge appearance="filled" color="danger" size="small">
              {t("removedLines", { count: stats.removed })}
            </Badge>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
              <Text size={200} weight="semibold" className="text-gray-600">
                dataPublic (Live)
              </Text>
              <Text size={200} className="text-gray-400">&rarr;</Text>
              <Text size={200} weight="semibold" className="text-gray-600">
                dataDraft (Draft)
              </Text>
            </div>
            <pre className="text-xs leading-5 overflow-auto max-h-[600px] m-0">
              {changes.map((part: Change, i: number) => {
                const lines = part.value.replace(/\n$/, "").split("\n");
                return lines.map((line: string, j: number) => {
                  const key = `${i}-${j}`;
                  if (part.added) {
                    return (
                      <div key={key} className="diff-added px-4 min-h-[1.25rem]">
                        <span className="diff-sign select-none mr-2 text-green-600">+</span>
                        {line}
                      </div>
                    );
                  }
                  if (part.removed) {
                    return (
                      <div key={key} className="diff-removed px-4 min-h-[1.25rem]">
                        <span className="diff-sign select-none mr-2 text-red-600">-</span>
                        {line}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="px-4 min-h-[1.25rem] text-gray-500">
                      <span className="diff-sign select-none mr-2">&nbsp;</span>
                      {line}
                    </div>
                  );
                });
              })}
            </pre>
          </div>
        </>
      )}

      {permissions.canPromote && (
        <div className="pt-2">
          <Button
            appearance="primary"
            icon={<ArrowUpRegular />}
            onClick={() => setPromoteDialogOpen(true)}
          >
            {t("promoteDraftToLive")}
          </Button>
        </div>
      )}

      <Dialog
        open={promoteDialogOpen}
        onOpenChange={(_, d) => setPromoteDialogOpen(d.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("promoteDraftToLive")}</DialogTitle>
            <DialogContent>
              {t("promoteConfirmText")}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setPromoteDialogOpen(false)}
                appearance="secondary"
              >
                {tc("cancel")}
              </Button>
              <Button
                onClick={handlePromote}
                appearance="primary"
                disabled={isPromoting}
              >
                {isPromoting ? t("promoting") : t("promoteToLive")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
