"use client";

import {
  Input,
  Textarea,
  Label,
  Dropdown,
  Option,
  SpinButton,
  Text,
} from "@fluentui/react-components";
import { useGetCategoriesQuery } from "@/lib/store/api";
import type { QuestFormState } from "../QuestEditorPage";
import type { Quest } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface InfoTabProps {
  form: QuestFormState;
  updateForm: (updates: Partial<QuestFormState>) => void;
  quest: Quest | null;
  isNew: boolean;
}

export function InfoTab({ form, updateForm, quest, isNew }: InfoTabProps) {
  const { data: categories } = useGetCategoriesQuery();

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  const selectedCategory = form.category ? categories?.[form.category] : undefined;
  const tierEntries = selectedCategory
    ? Object.entries(selectedCategory.tiers).sort(
        ([, a], [, b]) => a.order - b.order
      )
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-3">Quest Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-id" required>Quest ID</Label>
            <Input
              id="quest-id"
              value={form.id}
              onChange={(_, d) => updateForm({ id: d.value })}
              placeholder="e.g., mtr-central-line"
              disabled={!isNew}
              pattern="[a-z0-9_-]+"
            />
            {isNew && (
              <Text size={200} className="text-gray-500">
                Lowercase letters, numbers, hyphens, underscores. No double underscores.
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-name" required>Name</Label>
            <Input
              id="quest-name"
              value={form.name}
              onChange={(_, d) => updateForm({ name: d.value })}
              placeholder="e.g., Central Line Tour"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-points">Quest Points</Label>
            {isNew ? (
              <SpinButton
                id="quest-points"
                value={form.questPoints}
                onChange={(_, d) => updateForm({ questPoints: d.value ?? 0 })}
                min={0}
              />
            ) : (
              <div>
                <span className="text-lg font-semibold me-2">{form.questPoints}</span>
                <span className="text-xs text-gray-500 mt-0.5">
                  Use &quot;QP Adjustment&quot; tab
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Category</Label>
            <Dropdown
              placeholder="Select category"
              value={
                form.category && categories?.[form.category]
                  ? categories[form.category].name
                  : form.category || ""
              }
              onOptionSelect={(_, d) => {
                const val = d.optionValue === "__none__" ? "" : (d.optionValue ?? "");
                updateForm({ category: val, tier: "" });
              }}
            >
              <Option value="__none__">None</Option>
              {categoryEntries.map(([id, cat]) => (
                <Option key={id} value={id}>{cat.name}</Option>
              ))}
            </Dropdown>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Tier</Label>
            <Dropdown
              placeholder="Select tier"
              value={
                form.tier && selectedCategory?.tiers[form.tier]
                  ? selectedCategory.tiers[form.tier].name
                  : form.tier || ""
              }
              onOptionSelect={(_, d) => {
                updateForm({ tier: d.optionValue === "__none__" ? "" : (d.optionValue ?? "") });
              }}
              disabled={!form.category || tierEntries.length === 0}
            >
              <Option value="__none__">None</Option>
              {tierEntries.map(([id, tier]) => (
                <Option key={id} value={id}>{tier.name}</Option>
              ))}
            </Dropdown>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <Label htmlFor="quest-desc">Description</Label>
          <Textarea
            id="quest-desc"
            value={form.description}
            onChange={(_, d) => updateForm({ description: d.value })}
            placeholder="Describe this quest..."
            resize="vertical"
            rows={3}
          />
        </div>
      </section>

      {/* Quest info (read-only) */}
      {quest && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="text-gray-500">Created by</div>
            <div>{quest.createdBy.username}</div>
            <div className="text-gray-500">Created</div>
            <div>
              {formatDistanceToNow(new Date(quest.createdAt), {
                addSuffix: true,
              })}
            </div>
            <div className="text-gray-500">Last modified by</div>
            <div>{quest.lastModifiedBy.username}</div>
            <div className="text-gray-500">Last modified</div>
            <div>
              {formatDistanceToNow(new Date(quest.lastModifiedAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
