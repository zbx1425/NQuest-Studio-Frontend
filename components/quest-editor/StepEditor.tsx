"use client";

import { Button, Label, Text, Card, CardHeader, Divider } from "@fluentui/react-components";
import { DeleteRegular, AddRegular, ArrowUpRegular, ArrowDownRegular, LayoutAddAboveRegular, ShieldAddRegular } from "@fluentui/react-icons";
import type { Step } from "@/lib/types";
import { createDefaultCriterion } from "@/lib/criterion";
import { CriterionEditor } from "./CriterionEditor";
import { useTranslations } from "next-intl";

interface StepEditorProps {
  step: Step;
  index: number;
  onChange: (step: Step) => void;
  onDelete: () => void;
  onInsertAbove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function StepEditor({ step, index, onChange, onDelete, onInsertAbove, onMoveUp, onMoveDown, isFirst, isLast }: StepEditorProps) {
  const t = useTranslations("editor");
  return (
    <Card appearance="outline" className="relative">
      <div className="flex items-center absolute top-2 right-2">
        {!step.failureCriteria && <>
          <Button
            appearance="subtle"
            icon={<ShieldAddRegular />}
            size="small"
            onClick={() =>onChange({
              ...step,
              failureCriteria: createDefaultCriterion("TeleportDetectCriterion"),
            })}
            title={t("addStepFailureCondition")}
          />
          <Divider vertical className="mx-2" />
        </>}
        <Button
          appearance="subtle"
          icon={<LayoutAddAboveRegular />}
          size="small"
          onClick={onInsertAbove}
          title={t("insertStepAbove")}
        />
        <Button
          appearance="subtle"
          icon={<ArrowUpRegular />}
          size="small"
          onClick={onMoveUp}
          disabled={isFirst}
          title={t("moveStepUp")}
        />
        <Button
          appearance="subtle"
          icon={<ArrowDownRegular />}
          size="small"
          onClick={onMoveDown}
          disabled={isLast}
          title={t("moveStepDown")}
        />
        <Button
          appearance="subtle"
          icon={<DeleteRegular />}
          size="small"
          onClick={onDelete}
          title={t("removeStep")}
        />
      </div>
      <div className="space-y-3">
        <div>
          <Label size="small" className="mb-1 block font-medium">{t("stepN", { n: index + 1 })} {t("completionCriteria")}</Label>
          <CriterionEditor
            value={step.criteria}
            onChange={(criteria) => onChange({ ...step, criteria })}
          />
        </div>

        {step.failureCriteria && (
          <div>
            <Label size="small" className="mb-1 block font-medium">{t("stepFailureCondition")}</Label>
            <CriterionEditor
              value={step.failureCriteria}
              onChange={(failureCriteria) =>
                onChange({ ...step, failureCriteria })
              }
              onDelete={() => onChange({ ...step, failureCriteria: undefined })}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
