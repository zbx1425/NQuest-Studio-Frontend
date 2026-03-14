"use client";

import { formatDuration } from "@/lib/utils/duration";
import { LineNameBadge } from "@/components/ranking/LineNameBadge";
import { useTranslations } from "next-intl";
import type { StepDetail } from "@/lib/types";

import {
  parseLineName,
  getLineExtra,
} from "@/lib/utils/lineName";

interface StepDurationsDetailProps {
  stepDetails: Record<string, StepDetail>;
  totalDuration?: number;
}

export function StepDurationsDetail({
  stepDetails,
}: StepDurationsDetailProps) {
  const t = useTranslations("ranking");
  const entries = Object.entries(stepDetails)
    .map(([key, detail]) => ({ index: parseInt(key, 10), ...detail }))
    .sort((a, b) => a.index - b.index);

  if (entries.length === 0) return null;

  const maxMs = Math.max(...entries.map((e) => e.durationMillis));

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {t("stepBreakdown")}
      </p>
      <div className="flex flex-col">
        {entries.map((step, i) => {
          const pct = maxMs > 0 ? (step.durationMillis / maxMs) * 100 : 0;
          const hasLines = step.linesRidden.length > 0;

          // Group lines by base name to merge extras
          const groupedLines = step.linesRidden.reduce((acc, rawLine) => {
            const baseNames = parseLineName(rawLine);
            if (baseNames.length === 0) return acc;
            
            const baseKey = baseNames.join("||"); // unique key for base names combination
            const extra = getLineExtra(rawLine);

            if (!acc[baseKey]) {
              acc[baseKey] = { baseNames, extras: [], count: 0 };
            }
            acc[baseKey].count += 1;
            
            if (extra) {
              // Avoid duplicates
              if (!acc[baseKey].extras.includes(extra)) {
                acc[baseKey].extras.push(extra);
              }
            }
            return acc;
          }, {} as Record<string, { baseNames: string[]; extras: string[]; count: number }>);

          const groupedLineValues = Object.values(groupedLines);

          return (
            <div
              key={step.index}
              className={`p-2 rounded-md ${
                i % 2 === 0 ? "bg-gray-100" : "bg-transparent"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 flex-1 shrink-0 line-clamp-2" title={step.description ?? undefined}>
                  {step.description ?? t("stepN", { n: step.index + 1 })}
                </span>
                <div className="flex-1 flex flex-col">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  {hasLines && (
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {groupedLineValues.map((group, idx) => (
                        <LineNameBadge
                          key={`${group.baseNames.join("|")}-${idx}`}
                          displayNames={group.baseNames}
                          extras={group.count > 1 ? group.extras : undefined}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-700 w-16 text-right shrink-0">
                  {formatDuration(step.durationMillis)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
