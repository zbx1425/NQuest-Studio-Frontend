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
      ? structuredClone(quest.dataDraft.defaultCriteria)
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
  const [activeTab, setActiveTab] = useState("steps");
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
          defaultCriteria: form.defaultCriteria,
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
          defaultCriteria: form.defaultCriteria,
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
    <div className="flex h-full">
      {/* Left sidebar tabs */}
      <div className="border-r flex flex-col shrink-0">
        <TabList
          vertical
          selectedValue={activeTab}
          onTabSelect={(_, d) => setActiveTab(d.value as string)}
          size="small"
          className="p-2"
        >
          <Tab value="steps" icon={<ListRegular />}>Steps</Tab>
          <Tab value="info" icon={<InfoRegular />}>Info</Tab>
          {permissions.canManageAcl && (
            <Tab value="acl" icon={<PeopleRegular />}>ACL</Tab>
          )}
          <Tab value="json" icon={<CodeRegular />}>JSON</Tab>
        </TabList>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <QuestToolbar
          quest={questData ?? null}
          isNew={isNew}
          isSaving={isSaving}
          onSave={handleSave}
          canSave={isLoggedIn && (isNew || permissions.canEdit)}
        />

        <div className="flex-1 overflow-auto p-4">
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
        </div>
      </div>
    </div>
  );
}
