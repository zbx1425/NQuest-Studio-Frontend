"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Tab,
  TabList,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import {
  ListRegular,
  InfoRegular,
  PeopleRegular,
  CodeRegular,
  DocumentSearchRegular,
  DataBarVerticalRegular,
  CurrencyDollarEuroRegular,
} from "@fluentui/react-icons";
import {
  useGetQuestQuery,
  useCreateQuestMutation,
  useUpdateQuestMutation,
  useLazyGetJobStatusQuery,
} from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { StatsTab } from "./tabs/StatsTab";
import { QpAdjustmentTab } from "./tabs/QpAdjustmentTab";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { createDefaultStep } from "@/lib/criterion";
import type { Quest, Step, Criterion } from "@/lib/types";
import { QuestToolbar } from "./QuestToolbar";
import { StepsTab } from "./tabs/StepsTab";
import { InfoTab } from "./tabs/InfoTab";
import { AclTab } from "./tabs/AclTab";
import { JsonTab } from "./tabs/JsonTab";
import { ReviewTab } from "./tabs/ReviewTab";
import { useTranslations } from "next-intl";
import React from "react";

export interface QuestFormState {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  questPoints: number;
  excludeFirstStep: boolean;
  steps: Step[];
  defaultCriteria: Criterion | null;
}

function questToForm(quest: Quest): QuestFormState {
  return {
    id: quest.id,
    name: quest.name,
    description: quest.description ?? "",
    category: quest.category ?? "",
    tier: quest.tier ?? "",
    questPoints: quest.questPoints,
    excludeFirstStep: quest.excludeFirstStep ?? false,
    steps: structuredClone(quest.dataDraft.steps),
    defaultCriteria: quest.dataDraft.defaultCriteria
      ? structuredClone(quest.dataDraft.defaultCriteria.failureCriteria)
      : null,
  };
}

function createNewFormState(): QuestFormState {
  return {
    id: "",
    name: "",
    description: "",
    category: "",
    tier: "",
    questPoints: 0,
    excludeFirstStep: true,
    steps: [createDefaultStep()],
    defaultCriteria: null,
  };
}

export function QuestEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questId = searchParams.get("id");
  const isNew = !questId;

  const { isLoggedIn } = useAuth();
  const toast = useAppToast();
  const t = useTranslations("editor");

  const {
    data: questData,
    isLoading,
    error: loadError,
  } = useGetQuestQuery(questId!, { skip: isNew });

  const [createQuest, { isLoading: isCreating }] = useCreateQuestMutation();
  const [updateQuest, { isLoading: isUpdating }] = useUpdateQuestMutation();

  const [form, setForm] = useState<QuestFormState>(createNewFormState);
  const [activeTab, setActiveTab] = useState("info");
  const [initialized, setInitialized] = useState(isNew);

  const permissions = usePermissions(questData);

  const [triggerJobStatus] = useLazyGetJobStatusQuery();
  const [jobProgress, setJobProgress] = useState<{
    processed: number;
    total: number;
    status: string;
  } | null>(null);
  const pollingRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const pollJob = useCallback(
    async (id: string) => {
      try {
        const result = await triggerJobStatus(id).unwrap();
        setJobProgress({
          processed: result.progress.processed,
          total: result.progress.total,
          status: result.status,
        });

        if (result.status === "COMPLETED" || result.status === "FAILED") {
          return;
        }

        pollingRef.current = setTimeout(() => pollJob(id), 2000);
      } catch {
        pollingRef.current = setTimeout(() => pollJob(id), 5000);
      }
    },
    [triggerJobStatus]
  );

  useEffect(() => {
    if (questId && (permissions.canEdit)) {
      pollJob(`recalc-${questId}`);
    }
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [questId, pollJob, permissions.canEdit]);

  useEffect(() => {
    if (questData && !initialized) {
      setForm(questToForm(questData));
      setInitialized(true);
    }
  }, [questData, initialized]);

  const updateForm = useCallback(
    (updates: Partial<QuestFormState>) => {
      setForm((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleSave = async () => {
    try {
      if (isNew) {
        const result = await createQuest({
          id: form.id,
          name: form.name,
          description: form.description || undefined,
          category: form.category || undefined,
          tier: form.tier || undefined,
          questPoints: form.questPoints,
          excludeFirstStep: form.excludeFirstStep,
          steps: form.steps,
          defaultCriteria: form.defaultCriteria
            ? { failureCriteria: form.defaultCriteria }
            : null,
        }).unwrap();
        toast.success(t("questCreated"), t("questCreatedBody", { name: result.name }));
        router.replace(`/author/editor?id=${encodeURIComponent(result.id)}`);
      } else {
        const result = await updateQuest({
          id: questId,
          name: form.name,
          description: form.description || null,
          category: form.category || null,
          tier: form.tier || null,
          questPoints: form.questPoints,
          excludeFirstStep: form.excludeFirstStep,
          steps: form.steps,
          defaultCriteria: form.defaultCriteria
            ? { failureCriteria: form.defaultCriteria }
            : null,
        }).unwrap();
        setForm(questToForm(result));
        toast.success(t("questSaved"), result.hasPendingDraft
          ? t("questSavedPending")
          : t("questSavedSuccess"));
      }
    } catch (err) {
      const { title, body } = extractApiError(err);
      toast.error(title, body);
    }
  };

  const isSaving = isCreating || isUpdating;

  if (!isNew && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="large" label={t("loadingQuest")} />
      </div>
    );
  }

  if (!isNew && loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>{t("failedToLoad")}</MessageBarTitle>
            {t("failedToLoadBody", { id: questId })}
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="flex h-full max-w-7xl mx-auto px-4 py-4">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="px-4 pt-6 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t("questEditor")}
          </p>
          {isNew ? (
            <p className="font-semibold mt-2">{t("newQuest")}</p>
          ) : questData ? (
            <div className="mt-2">
              <p className="font-semibold truncate">
                {form.name || questData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {questId}
              </p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 px-2">
          <TabList
            vertical
            selectedValue={activeTab}
            onTabSelect={(_, d) => setActiveTab(d.value as string)}
            size="large"
            appearance="subtle"
          >
            <Tab value="info" icon={<InfoRegular />}>{t("info")}</Tab>
            <Tab value="steps" icon={<ListRegular />}>{t("steps")}</Tab>
            {permissions.canManageAcl && (
              <Tab value="acl" icon={<PeopleRegular />}>{t("acl")}</Tab>
            )}
            <Tab value="json" icon={<CodeRegular />}>{t("json")}</Tab>
            {questData?.hasPendingDraft && questData.status === "PUBLIC" && questData.dataPublic && (
              <Tab value="review" icon={<DocumentSearchRegular />}>{t("review")}</Tab>
            )}
            {!isNew && questId && (
              <Tab value="stats" icon={<DataBarVerticalRegular />}>{t("stats")}</Tab>
            )}
            {!isNew && questData && permissions.canEdit && (
              <Tab value="qp-adjust" icon={<CurrencyDollarEuroRegular />}>{t("qpAdjustment")}</Tab>
            )}
          </TabList>
        </nav>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <QuestToolbar
          quest={questData ?? null}
          isNew={isNew}
          isSaving={isSaving}
          onSave={handleSave}
          canSave={isLoggedIn && (isNew || permissions.canEdit)}
          onNavigateToReview={() => setActiveTab("review")}
        />

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
          {jobProgress && (jobProgress.status === "PROCESSING" || jobProgress.status === "FAILED") && (
            <MessageBar intent={jobProgress.status === "FAILED" ? "error" : "info"} className="shrink-0">
              <MessageBarBody>
                <MessageBarTitle>
                  {jobProgress.status === "FAILED" ? t("recalcFailed") : t("recalcProgress")}
                </MessageBarTitle>
                {jobProgress.status === "PROCESSING" && (
                  <div className="flex items-center gap-2 mt-1">
                    <Spinner size="tiny" />
                    <span>
                      {Math.round((jobProgress.processed / jobProgress.total) * 100)}% ({jobProgress.processed}/{jobProgress.total})
                    </span>
                  </div>
                )}
              </MessageBarBody>
            </MessageBar>
          )}

          <div className="flex-1">
            {activeTab === "steps" && (
              <StepsTab form={form} updateForm={updateForm} />
            )}
            {activeTab === "info" && (
              <InfoTab
                form={form}
                updateForm={updateForm}
                quest={questData ?? null}
                isNew={isNew}
              />
            )}
            {activeTab === "acl" && questData && (
              <AclTab quest={questData} />
            )}
            {activeTab === "json" && (
              <JsonTab form={form} setForm={setForm} />
            )}
            {activeTab === "review" && questData && (
              <ReviewTab quest={questData} />
            )}
            {activeTab === "stats" && questId && (
              <StatsTab questId={questId} />
            )}
            {activeTab === "qp-adjust" && questData && (
              <QpAdjustmentTab quest={questData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
