"use client";

import { Button, Label, Text, Card, CardHeader } from "@fluentui/react-components";
import { DeleteRegular, AddRegular, ArrowUpRegular, ArrowDownRegular } from "@fluentui/react-icons";
import type { Step } from "@/lib/types";
import { createDefaultCriterion } from "@/lib/criterion";
import { CriterionEditor } from "./CriterionEditor";

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
  return (
    <Card appearance="outline" size="small">
      <CardHeader
        header={<Text weight="semibold" size={300}>Step {index + 1}</Text>}
        action={
          <div className="flex items-center">
            <Button
              appearance="subtle"
              icon={<AddRegular />}
              size="small"
              onClick={onInsertAbove}
              title="Insert step above"
            />
            <Button
              appearance="subtle"
              icon={<ArrowUpRegular />}
              size="small"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Move step up"
            />
            <Button
              appearance="subtle"
              icon={<ArrowDownRegular />}
              size="small"
              onClick={onMoveDown}
              disabled={isLast}
              title="Move step down"
            />
            <Button
              appearance="subtle"
              icon={<DeleteRegular />}
              size="small"
              onClick={onDelete}
              title="Remove step"
            />
          </div>
        }
      />

      <div className="space-y-3">
        <div>
          <Label size="small" className="mb-1 block font-medium">Completion Criteria</Label>
          <CriterionEditor
            value={step.criteria}
            onChange={(criteria) => onChange({ ...step, criteria })}
          />
        </div>

        {step.failureCriteria ? (
          <div>
            <Label size="small" className="mb-1 block font-medium">Step Failure Condition</Label>
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
            Add Step Failure Condition
          </Button>
        )}
      </div>
    </Card>
  );
}
