"use client";

import { Button, Label } from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import type { Step, Criterion } from "@/lib/types";
import { createDefaultStep, createDefaultCriterion } from "@/lib/criterion";
import { StepEditor } from "../StepEditor";
import { CriterionEditor } from "../CriterionEditor";
import type { QuestFormState } from "../QuestEditorPage";

interface StepsTabProps {
  form: QuestFormState;
  updateForm: (updates: Partial<QuestFormState>) => void;
}

export function StepsTab({ form, updateForm }: StepsTabProps) {
  const handleStepChange = (index: number, step: Step) => {
    const updated = [...form.steps];
    updated[index] = step;
    updateForm({ steps: updated });
  };

  const handleStepDelete = (index: number) => {
    updateForm({ steps: form.steps.filter((_, i) => i !== index) });
  };

  const handleAddStep = () => {
    updateForm({ steps: [...form.steps, createDefaultStep()] });
  };

  return (
    <div className="space-y-6">
      {/* Quest-wide failure condition */}
      <section>
        {form.defaultCriteria ? (
          <div>
            <Label className="mb-1 block font-medium">
              Quest-Wide Failure Condition
            </Label>
            <CriterionEditor
              value={form.defaultCriteria}
              onChange={(defaultCriteria: Criterion) =>
                updateForm({ defaultCriteria })
              }
              onDelete={() => updateForm({ defaultCriteria: null })}
            />
          </div>
        ) : (
          <Button
            appearance="subtle"
            icon={<AddRegular />}
            onClick={() =>
              updateForm({
                defaultCriteria: createDefaultCriterion(
                  "TeleportDetectCriterion"
                ),
              })
            }
          >
            Add Quest-Wide Failure Condition
          </Button>
        )}
      </section>

      {/* Steps */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Steps ({form.steps.length})
        </h2>

        {form.steps.map((step, index) => (
          <StepEditor
            key={index}
            step={step}
            index={index}
            onChange={(s) => handleStepChange(index, s)}
            onDelete={() => handleStepDelete(index)}
          />
        ))}

        <Button appearance="primary" icon={<AddRegular />} onClick={handleAddStep}>
          Add Step
        </Button>
      </section>
    </div>
  );
}
