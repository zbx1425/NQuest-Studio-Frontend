import { parseLineName, getLineExtra } from "@/lib/utils/lineName";

interface LineNameBadgeProps {
  /**
   * The raw line string (e.g. "Name|Alt||Extra").
   * If `displayNames` is provided, this is ignored for display name parsing,
   * but may still be used for fallback or other purposes if needed.
   */
  name?: string;
  /**
   * Manually provided display names (e.g. ["Name", "Alt"]).
   * Overrides parsing from `name`.
   */
  displayNames?: string[];
  /**
   * Additional info to show (e.g. "Express", "Local").
   * If provided, these are shown alongside the name.
   */
  extras?: string[];
}

export function LineNameBadge({
  name,
  displayNames,
  extras,
}: LineNameBadgeProps) {
  let parts: string[] = [];
  let extraInfo: string[] = extras || [];

  if (displayNames && displayNames.length > 0) {
    parts = displayNames;
  } else if (name) {
    parts = parseLineName(name);
    // If extras not manually provided, try to extract from name if possible
    if (!extras || extras.length === 0) {
      const extracted = getLineExtra(name);
      if (extracted) {
        extraInfo = [extracted];
      }
    }
  }

  if (parts.length === 0) return null;

  const [primary, ...rest] = parts;
  
  // Construct a title for hover
  const titleParts = [...parts];
  if (extraInfo.length > 0) {
    titleParts.push(`(${extraInfo.join(", ")})`);
  }
  const fullText = titleParts.join(" · ");

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] leading-tight px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 whitespace-nowrap max-w-full"
      title={fullText}
    >
      <span className="font-medium truncate">{primary}</span>
      {/* Secondary names */}
      {rest.length > 0 && (
        <span className="text-blue-400 truncate hidden sm:inline">
          {rest.join(" · ")}
        </span>
      )}
      {/* Extras */}
      {extraInfo.length > 0 && (
        <span className="text-blue-500 font-normal ml-0.5 truncate max-w-[80px]">
          ({extraInfo.join(", ")})
        </span>
      )}
    </span>
  );
}
