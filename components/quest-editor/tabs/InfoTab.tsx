"use client";

import {
  Input,
  Textarea,
  Label,
  Dropdown,
  Option,
  Text,
} from "@fluentui/react-components";
import { useGetCategoriesQuery } from "@/lib/store/api";
import type { QuestFormState } from "../QuestEditorPage";
import type { Quest } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { MinecraftTooltipPreview } from "../MinecraftTooltipPreview";
import { useTranslations } from "next-intl";
import { useDateLocale } from "@/lib/hooks/useDateLocale";

interface InfoTabProps {
  form: QuestFormState;
  updateForm: (updates: Partial<QuestFormState>) => void;
  quest: Quest | null;
  isNew: boolean;
}

export function InfoTab({ form, updateForm, quest, isNew }: InfoTabProps) {
  const { data: categories } = useGetCategoriesQuery();
  const t = useTranslations("editor");
  const tc = useTranslations("common");
  const dateLocale = useDateLocale();

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  const selectedCategory = form.category ? categories?.[form.category] : undefined;
  const tierEntries = selectedCategory
    ? Object.entries(selectedCategory.tiers).sort(
        ([, a], [, b]) => a.order - b.order
      )
    : [];
  const selectedTierName =
    form.tier && selectedCategory?.tiers?.[form.tier]?.name || undefined;

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("questMetadata")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-id" required>{t("questId")}</Label>
            <Input
              id="quest-id"
              value={form.id}
              onChange={(_, d) => updateForm({ id: d.value })}
              placeholder={t("questIdPlaceholder")}
              disabled={!isNew}
              pattern="[a-z0-9_-]+"
            />
            {isNew && (
              <Text size={200} className="text-gray-500">
                {t("questIdHint")}
              </Text>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-name" required>{t("questName")}</Label>
            <Input
              id="quest-name"
              value={form.name}
              onChange={(_, d) => updateForm({ name: d.value })}
              placeholder={t("questNamePlaceholder")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="quest-points">{t("questPoints")}</Label>
            {isNew ? (
              <Input
                id="quest-points"
                type="number"
                value={String(form.questPoints)}
                onChange={(_, d) => updateForm({ questPoints: Math.max(0, Number(d.value) || 0) })}
                min={0}
              />
            ) : (
              <div>
                <span className="text-lg font-semibold me-2">{form.questPoints}</span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {t("questPointsHint")}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>{t("category")}</Label>
            <Dropdown
              placeholder={t("categoryPlaceholder")}
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
              <Option value="__none__">{tc("none")}</Option>
              {categoryEntries.map(([id, cat]) => (
                <Option key={id} value={id}>{cat.name}</Option>
              ))}
            </Dropdown>
          </div>

          <div className="flex flex-col gap-1">
            <Label>{t("tier")}</Label>
            <Dropdown
              placeholder={t("tierPlaceholder")}
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
              <Option value="__none__">{tc("none")}</Option>
              {tierEntries.map(([id, tier]) => (
                <Option key={id} value={id}>{tier.name}</Option>
              ))}
            </Dropdown>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <Label htmlFor="quest-desc">{t("descriptionLabel")}</Label>
          <Textarea
            id="quest-desc"
            value={form.description}
            onChange={(_, d) => updateForm({ description: d.value })}
            placeholder={t("descriptionPlaceholder")}
            resize="vertical"
            rows={3}
          />
        </div>

        <MinecraftTooltipPreview
          name={form.name}
          description={form.description}
          tierName={selectedTierName}
        />
      </section>

      {/* Quest info (read-only) */}
      {quest && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("details")}</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="text-gray-500">{t("createdBy")}</div>
            <div>{quest.createdBy.username}</div>
            <div className="text-gray-500">{t("created")}</div>
            <div>
              {formatDistanceToNow(new Date(quest.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </div>
            <div className="text-gray-500">{t("lastModifiedBy")}</div>
            <div>{quest.lastModifiedBy.username}</div>
            <div className="text-gray-500">{t("lastModified")}</div>
            <div>
              {formatDistanceToNow(new Date(quest.lastModifiedAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
