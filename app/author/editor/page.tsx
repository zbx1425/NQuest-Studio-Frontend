"use client";

import { Suspense } from "react";
import { Spinner } from "@fluentui/react-components";
import { QuestEditorPage } from "@/components/quest-editor/QuestEditorPage";

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner size="large" />
        </div>
      }
    >
      <QuestEditorPage />
    </Suspense>
  );
}
