"use client";

import { Button, Label, Text, Card, CardHeader } from "@fluentui/react-components";
import { DeleteRegular, AddRegular, ArrowUpRegular, ArrowDownRegular } from "@fluentui/react-icons";
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
    <Card appearance="outline" size="small">
      <CardHeader
        header={<Text weight="semibold" size={300}>{t("stepN", { n: index + 1 })}</Text>}
        action={
          <div className="flex items-center">
            <Button
              appearance="subtle"
              icon={<AddRegular />}
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
        }
      />

      <div className="space-y-3">
        <div>
          <Label size="small" className="mb-1 block font-medium">{t("completionCriteria")}</Label>
          <CriterionEditor
            value={step.criteria}
            onChange={(criteria) => onChange({ ...step, criteria })}
          />
        </div>

        {step.failureCriteria ? (
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
        ) : (
          <Button
            appearance="subtle"
            size="small"
            icon={<AddRegular />}
            onClick={() =>
              onChange({
                ...step,
                failureCriteria: createDefaultCriterion("TeleportDetectCriterion"),
              })
            }
          >
            {t("addStepFailureCondition")}
          </Button>
        )}
      </div>
    </Card>
  );
}
