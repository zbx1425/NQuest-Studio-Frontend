import { formatDuration } from "@/lib/utils/duration";

interface StepDurationsDetailProps {
  stepDurations: Record<string, number>;
  totalDuration: number;
}

export function StepDurationsDetail({
  stepDurations,
  totalDuration,
}: StepDurationsDetailProps) {
  const entries = Object.entries(stepDurations)
    .map(([key, ms]) => ({ index: parseInt(key, 10), ms }))
    .sort((a, b) => a.index - b.index);

  if (entries.length === 0) return null;

  const maxMs = Math.max(...entries.map((e) => e.ms));

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Step Breakdown
      </p>
      <div className="space-y-1">
        {entries.map((step) => {
          const pct = maxMs > 0 ? (step.ms / maxMs) * 100 : 0;
          return (
            <div key={step.index} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-14 shrink-0">
                Step {step.index + 1}
              </span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-gray-700 w-16 text-right shrink-0">
                {formatDuration(step.ms)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
