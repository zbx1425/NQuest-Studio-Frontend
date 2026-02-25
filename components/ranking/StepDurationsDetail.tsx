"use client";

import { formatDuration } from "@/lib/utils/duration";
import { LineNameBadge } from "@/components/ranking/LineNameBadge";
import { useTranslations } from "next-intl";
import type { StepDetail } from "@/lib/types";

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
      <div className="space-y-1.5">
        {entries.map((step) => {
          const pct = maxMs > 0 ? (step.durationMillis / maxMs) * 100 : 0;
          const hasLines = step.linesRidden.length > 0;
          return (
            <div key={step.index}>
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 w-40 max-w-40 shrink-0 line-clamp-2" title={step.description ?? undefined}>
                  {step.description ?? t("stepN", { n: step.index + 1 })}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-700 w-16 text-right shrink-0">
                  {formatDuration(step.durationMillis)}
                </span>
              </div>
              {hasLines && (
                <div className="flex gap-1 flex-wrap ml-[calc(10rem+0.5rem)] mt-0.5">
                  {step.linesRidden.map((line) => (
                    <LineNameBadge key={line} name={line} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
