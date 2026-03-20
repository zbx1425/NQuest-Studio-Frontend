"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle
} from "@fluentui/react-components";
import { ChevronDownRegular } from "@fluentui/react-icons";
import { useTranslations } from "next-intl";
import type { CriterionType } from "@/lib/types";
import { GROUPED_ORDERED_CRITERION_TYPES } from "@/lib/criterion";

interface CriterionTypePickerProps {
  value: CriterionType;
  onChange: (next: CriterionType) => void;
}

export function CriterionTypePicker({ value, onChange }: CriterionTypePickerProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("editor");
  const tc = useTranslations("common");

  const selectedTitle = t("criterionType." + value);

  const renderPickerContent = (
    <div className="space-y-4">
      {GROUPED_ORDERED_CRITERION_TYPES.map(({ type, children }) => (
        <section key={type} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            {t(`criterionTypeGroup.${type}`)}
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {children.map((type) => {
              const title = t("criterionType." + type);
              const desc = t("criterionType." + type + "Desc");
              const selected = value === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={[
                    "w-full border p-3 text-left transition-colors rounded-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                  ].join(" ")}
                  onClick={() => {
                    onChange(type);
                    setOpen(false);
                  }}
                >
                  <div className="text-sm flex items-baseline flex-row">
                    <span className="flex-1 font-semibold whitespace-nowrap">{title}</span>
                    <span className="text-gray-500 font-normal text-xs ms-2 truncate">{type.replace("Criterion", "")}</span>
                  </div>
                  {desc ? (
                    <div className="mt-1 text-xs leading-5 text-gray-500">{desc}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );

  const triggerButton = (
    <Button
      appearance="outline"
      size="small"
      icon={<ChevronDownRegular />}
      iconPosition="after"
      className="min-w-[280px] justify-between rounded-none"
      title={selectedTitle}
      aria-label={t("criterionTypePicker")}
      onClick={() => setOpen(true)}
    >
      <span className="truncate">{selectedTitle}</span>
    </Button>
  );

  return (
    <>
      {triggerButton}
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface className="max-h-[calc(100vh-1rem)]! w-280! max-w-[calc(100vw-1rem)]! rounded-none">
          <DialogBody className="min-h-0">
            <DialogTitle>{t("criterionTypePicker")}</DialogTitle>
            <DialogContent className="min-h-0 overflow-y-auto pr-1">
              {renderPickerContent}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                className="rounded-none"
                onClick={() => setOpen(false)}
              >
                {tc("cancel")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  )
}
