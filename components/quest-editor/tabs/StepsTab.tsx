"use client";

import { Button, Label } from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import type { Step, Criterion } from "@/lib/types";
import { createDefaultStep, createDefaultCriterion } from "@/lib/criterion";
import { StepEditor } from "../StepEditor";
import { CriterionEditor } from "../CriterionEditor";
import { useTranslations } from "next-intl";
import type { QuestFormState } from "../QuestEditorPage";

interface StepsTabProps {
  form: QuestFormState;
  updateForm: (updates: Partial<QuestFormState>) => void;
}

export function StepsTab({ form, updateForm }: StepsTabProps) {
  const t = useTranslations("editor");
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

  const handleMoveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.steps.length) return;
    const updated = [...form.steps];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    updateForm({ steps: updated });
  };

  const handleInsertStep = (atIndex: number) => {
    const updated = [...form.steps];
    updated.splice(atIndex, 0, createDefaultStep());
    updateForm({ steps: updated });
  };

  return (
    <div className="space-y-6">
      {/* Quest-wide failure condition */}
      <section>
        {form.defaultCriteria ? (
          <div>
            <Label className="mb-1 block font-medium">
              {t("questFailureCondition")}
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
            {t("addQuestFailureCondition")}
          </Button>
        )}
      </section>

      {/* Steps */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {t("stepsCount", { count: form.steps.length })}
        </h2>

        {form.steps.map((step, index) => (
          <StepEditor
            key={index}
            step={step}
            index={index}
            onChange={(s) => handleStepChange(index, s)}
            onDelete={() => handleStepDelete(index)}
            onInsertAbove={() => handleInsertStep(index)}
            onMoveUp={() => handleMoveStep(index, -1)}
            onMoveDown={() => handleMoveStep(index, 1)}
            isFirst={index === 0}
            isLast={index === form.steps.length - 1}
          />
        ))}

        <Button appearance="primary" icon={<AddRegular />} onClick={handleAddStep}>
          {t("addStep")}
        </Button>
      </section>
    </div>
  );
}
