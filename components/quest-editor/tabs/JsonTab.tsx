"use client";

import { useState } from "react";
import { Button, Textarea, Text } from "@fluentui/react-components";
import {
  ArrowImportRegular,
  CopyRegular,
  ArrowExportRegular,
} from "@fluentui/react-icons";
import { useAppToast } from "@/lib/hooks/useAppToast";
import type { QuestFormState } from "../QuestEditorPage";

interface JsonTabProps {
  form: QuestFormState;
  setForm: (form: QuestFormState) => void;
}

export function JsonTab({ form, setForm }: JsonTabProps) {
  const toast = useAppToast();
  const [importText, setImportText] = useState("");

  const exportJson = JSON.stringify(
    {
      id: form.id,
      name: form.name,
      description: form.description || undefined,
      category: form.category || undefined,
      tier: form.tier || undefined,
      questPoints: form.questPoints,
      steps: form.steps,
      defaultCriteria: form.defaultCriteria,
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
        defaultCriteria: parsed.defaultCriteria ?? null,
      });
      toast.success("Quest imported from JSON");
      setImportText("");
    } catch {
      toast.error("Invalid JSON", "Please check the JSON format and try again.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy", "Please select and copy the text manually.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Export */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <ArrowExportRegular />
          <h2 className="text-lg font-semibold">Export</h2>
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
          className="mt-2"
          size="small"
        >
          Copy to Clipboard
        </Button>
      </section>

      {/* Import */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <ArrowImportRegular />
          <h2 className="text-lg font-semibold">Import</h2>
        </div>
        <Text size={200} className="text-gray-500 mb-2 block">
          Paste quest JSON below. This will overwrite the current editor state.
        </Text>
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
          className="mt-2"
          size="small"
        >
          Import
        </Button>
      </section>
    </div>
  );
}
