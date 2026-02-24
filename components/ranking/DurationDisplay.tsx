import { formatDuration } from "@/lib/utils/duration";

interface DurationDisplayProps {
  ms: number;
  className?: string;
}

export function DurationDisplay({ ms, className = "" }: DurationDisplayProps) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatDuration(ms)}
    </span>
  );
}
