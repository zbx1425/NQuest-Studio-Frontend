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
} from "@fluentui/react-icons";
import {
  useGetQuestQuery,
  useCreateQuestMutation,
  useUpdateQuestMutation,
} from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useAppToast, extractApiError } from "@/lib/hooks/useAppToast";
import { createDefaultStep } from "@/lib/criterion";
import type { Quest, Step, Criterion } from "@/lib/types";
import { QuestToolbar } from "./QuestToolbar";
import { StepsTab } from "./tabs/StepsTab";
import { InfoTab } from "./tabs/InfoTab";
import { AclTab } from "./tabs/AclTab";
import { JsonTab } from "./tabs/JsonTab";
import { ReviewTab } from "./tabs/ReviewTab";

export interface QuestFormState {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  questPoints: number;
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
          steps: form.steps,
          defaultCriteria: form.defaultCriteria
            ? { failureCriteria: form.defaultCriteria }
            : null,
        }).unwrap();
        toast.success("Quest created", `Quest "${result.name}" has been created.`);
        router.replace(`/editor?id=${encodeURIComponent(result.id)}`);
      } else {
        const result = await updateQuest({
          id: questId,
          name: form.name,
          description: form.description || null,
          category: form.category || null,
          tier: form.tier || null,
          questPoints: form.questPoints,
          steps: form.steps,
          defaultCriteria: form.defaultCriteria
            ? { failureCriteria: form.defaultCriteria }
            : null,
        }).unwrap();
        setForm(questToForm(result));
        toast.success("Quest saved", result.hasPendingDraft
          ? "Saved. There are pending draft changes awaiting admin approval."
          : "All changes saved successfully.");
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
        <Spinner size="large" label="Loading quest..." />
      </div>
    );
  }

  if (!isNew && loadError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Failed to load quest</MessageBarTitle>
            {questId} could not be loaded. It may not exist or you may not have permission.
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
            Quest Editor
          </p>
          {isNew ? (
            <p className="font-semibold mt-2">New Quest</p>
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
            <Tab value="info" icon={<InfoRegular />}>Info</Tab>
            <Tab value="steps" icon={<ListRegular />}>Steps</Tab>
            {permissions.canManageAcl && (
              <Tab value="acl" icon={<PeopleRegular />}>ACL</Tab>
            )}
            <Tab value="json" icon={<CodeRegular />}>JSON</Tab>
            {questData?.hasPendingDraft && questData.status === "PUBLIC" && questData.dataPublic && (
              <Tab value="review" icon={<DocumentSearchRegular />}>Review</Tab>
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

        <div className="flex-1 overflow-auto p-6">
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
        </div>
      </div>
    </div>
  );
}
