"use client";

import type { TimePeriod } from "@/lib/types";
import { useTranslations } from "next-intl";

const PERIODS: { value: TimePeriod; key: "allTime" | "monthly" | "weekly" }[] = [
  { value: "all_time", key: "allTime" },
  { value: "monthly", key: "monthly" },
  { value: "weekly", key: "weekly" },
];

interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  const t = useTranslations("period");
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 ${className ?? ""}`}>
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            value === p.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t(p.key)}
        </button>
      ))}
    </div>
  );
}
