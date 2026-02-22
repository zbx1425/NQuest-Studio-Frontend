"use client";

import { Button, Label, Text } from "@fluentui/react-components";
import { DeleteRegular, AddRegular } from "@fluentui/react-icons";
import type { Step } from "@/lib/types";
import { createDefaultCriterion } from "@/lib/criterion";
import { CriterionEditor } from "./CriterionEditor";

interface StepEditorProps {
  step: Step;
  index: number;
  onChange: (step: Step) => void;
  onDelete: () => void;
}

export function StepEditor({ step, index, onChange, onDelete }: StepEditorProps) {
  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b rounded-t-lg">
        <Text weight="semibold" size={300}>
          Step {index + 1}
        </Text>
        <div className="flex-1" />
        <Button
          appearance="subtle"
          icon={<DeleteRegular />}
          size="small"
          onClick={onDelete}
          title="Remove step"
        />
      </div>

      <div className="p-3 space-y-3">
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
    </div>
  );
}
