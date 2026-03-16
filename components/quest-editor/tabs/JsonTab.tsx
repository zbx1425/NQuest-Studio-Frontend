"use client";

import { useState } from "react";
import { Button, Textarea } from "@fluentui/react-components";
import {
  ArrowImportRegular,
  CopyRegular,
  ArrowExportRegular,
} from "@fluentui/react-icons";
import { useAppToast } from "@/lib/hooks/useAppToast";
import { useTranslations } from "next-intl";
import type { QuestFormState } from "../QuestEditorPage";

interface JsonTabProps {
  form: QuestFormState;
  setForm: (form: QuestFormState) => void;
}

export function JsonTab({ form, setForm }: JsonTabProps) {
  const toast = useAppToast();
  const t = useTranslations("editor");
  const [importText, setImportText] = useState("");

  const exportJson = JSON.stringify(
    {
      id: form.id,
      name: form.name,
      description: form.description || undefined,
      category: form.category || undefined,
      tier: form.tier || undefined,
      questPoints: form.questPoints,
      defaultCriteria: form.defaultCriteria
        ? { failureCriteria: form.defaultCriteria }
        : undefined,
      steps: form.steps,
    },
    null,
    2
  );

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      setForm({
        id: parsed.id ?? form.id,
        name: parsed.name ?? "",
        description: parsed.description ?? "",
        category: parsed.category ?? "",
        tier: parsed.tier ?? "",
        questPoints: parsed.questPoints ?? 0,
        steps: parsed.steps ?? [],
        defaultCriteria: parsed.defaultCriteria?.failureCriteria ?? null,
        excludeFirstStep: false
      });
      toast.success(t("questImported"));
      setImportText("");
    } catch {
      toast.error(t("invalidJson"), t("invalidJsonBody"));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      toast.success(t("copiedToClipboard"));
    } catch {
      toast.error(t("failedToCopy"), t("failedToCopyBody"));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Export */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <ArrowExportRegular />
          <h2 className="text-lg font-semibold">{t("export")}</h2>
        </div>
        <Textarea
          value={exportJson}
          readOnly
          resize="vertical"
          rows={12}
          className="w-full font-mono text-xs"
        />
        <Button
          appearance="secondary"
          icon={<CopyRegular />}
          onClick={handleCopy}
          className="mt-3"
        >
          {t("copyToClipboard")}
        </Button>
      </section>

      {/* Import */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <ArrowImportRegular />
          <h2 className="text-lg font-semibold">{t("import")}</h2>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          {t("importDesc")}
        </p>
        <Textarea
          value={importText}
          onChange={(_, d) => setImportText(d.value)}
          placeholder='{ "id": "...", "name": "...", ... }'
          resize="vertical"
          rows={8}
          className="w-full font-mono text-xs"
        />
        <Button
          appearance="primary"
          icon={<ArrowImportRegular />}
          onClick={handleImport}
          disabled={!importText.trim()}
          className="mt-3"
        >
          {t("import")}
        </Button>
      </section>
    </div>
  );
}
