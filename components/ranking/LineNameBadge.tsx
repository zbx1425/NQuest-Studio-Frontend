import { parseLineName } from "@/lib/utils/lineName";

interface LineNameBadgeProps {
  name: string;
}

export function LineNameBadge({ name }: LineNameBadgeProps) {
  const parts = parseLineName(name);
  if (parts.length === 0) return null;

  const [primary, ...rest] = parts;
  const fullText = parts.join(" · ");

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] leading-tight px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 whitespace-nowrap"
      title={fullText}
    >
      <span className="font-medium">{primary}</span>
      {rest.length > 0 && (
        <span className="text-blue-400">{rest.join(" · ")}</span>
      )}
    </span>
  );
}
