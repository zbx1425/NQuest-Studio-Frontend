"use client";

import { useMemo, useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";

const CHAR_W: Record<string, number> = {
  " ": 4, "!": 2, '"': 5, "#": 6, $: 6, "%": 6, "&": 6, "'": 3,
  "(": 5, ")": 5, "*": 5, "+": 6, ",": 2, "-": 6, ".": 2, "/": 6,
  "0": 6, "1": 6, "2": 6, "3": 6, "4": 6, "5": 6, "6": 6, "7": 6,
  "8": 6, "9": 6, ":": 2, ";": 2, "<": 5, "=": 6, ">": 5, "?": 6,
  "@": 7, A: 6, B: 6, C: 6, D: 6, E: 6, F: 6, G: 6,
  H: 6, I: 4, J: 6, K: 6, L: 6, M: 6, N: 6, O: 6,
  P: 6, Q: 6, R: 6, S: 6, T: 6, U: 6, V: 6, W: 6,
  X: 6, Y: 6, Z: 6, "[": 4, "\\": 6, "]": 4, "^": 6, _: 6, "`": 3,
  a: 6, b: 6, c: 6, d: 6, e: 6, f: 5, g: 6,
  h: 6, i: 2, j: 6, k: 5, l: 3, m: 6, n: 6, o: 6,
  p: 6, q: 6, r: 6, s: 6, t: 4, u: 6, v: 6, w: 6,
  x: 6, y: 6, z: 6, "{": 5, "|": 2, "}": 5, "~": 7,
};

function isCJK(c: number) {
  return (
    (c >= 0x2e80 && c <= 0x9fff) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe30 && c <= 0xfe4f) ||
    (c >= 0xff00 && c <= 0xff60) ||
    (c >= 0x20000 && c <= 0x2fa1f) ||
    (c >= 0xac00 && c <= 0xd7af)
  );
}

function mcTextWidth(s: string) {
  let w = 0;
  for (const ch of s) w += CHAR_W[ch] ?? (isCJK(ch.codePointAt(0)!) ? 9 : 6);
  return w;
}

function safeTooltipWidth(guiScale: number) {
  const sw = Math.floor(1920 / guiScale);
  return Math.floor((sw - 176) / 2 + 161 - 20);
}

interface Line {
  text: string;
  color: string;
  italic?: boolean;
  label: string;
  width: number;
}

interface Props {
  name: string;
  description: string;
  tierName?: string;
}

export function MinecraftTooltipPreview({
  name,
  description,
  tierName,
}: Props) {
  const [guiScale, setGuiScale] = useState(3);
  const safe = useMemo(() => safeTooltipWidth(guiScale), [guiScale]);

  const lines = useMemo<Line[]>(() => {
    const r: Line[] = [];
    const n = name || "(No name)";
    r.push({ text: n, color: "#fff", label: "Name", width: mcTextWidth(n) });
    if (tierName) {
      const t = `Tier: ${tierName}`;
      r.push({
        text: t,
        color: "#FFFF55",
        label: "Tier",
        width: mcTextWidth(t),
      });
    }
    if (description) {
      description.split("\n").forEach((l, i) => {
        r.push({
          text: l || " ",
          color: "#AAA",
          label: `L${i + 1}`,
          width: mcTextWidth(l),
        });
      });
    }
    return r;
  }, [name, description, tierName]);

  const maxW = Math.max(...lines.map((l) => l.width), 0);
  const scale = Math.max(safe * 1.15, maxW * 1.05);
  const overflow = lines.some((l) => l.width > safe);
  const chestPct = (176 / scale) * 100;
  const safePct = (safe / scale) * 100;

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold">Minecraft Tooltip Preview</span>
        <div className="flex items-center gap-1.5 ml-auto text-xs">
          <span className="text-gray-500">GUI Scale</span>
          <Dropdown
            size="small"
            value={String(guiScale)}
            selectedOptions={[String(guiScale)]}
            onOptionSelect={(_, d) => setGuiScale(Number(d.optionValue))}
            style={{ minWidth: 56 }}
          >
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
          </Dropdown>
        </div>
      </div>

      {/* MC tooltip */}
      <div
        className="inline-block max-w-full overflow-x-auto rounded-sm"
        style={{
          padding: "5px 7px",
          background: "#100010",
          border: "2px solid #100010",
          outline: "1px solid #2D0086",
          boxShadow:
            "inset 0 1px 0 #5000FF50, inset 0 -1px 0 #28007F50, " +
            "inset 1px 0 0 #3800C050, inset -1px 0 0 #3800C050",
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className="font-mono text-[13px] leading-[18px]"
            style={{
              color: l.color,
              fontStyle: l.italic ? "italic" : undefined,
              whiteSpace: "pre",
              textShadow: "1px 1px 0px rgba(0,0,0,0.4)",
            }}
          >
            {l.text}
          </div>
        ))}
      </div>

      {/* Width bars */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          Line width — safe limit {safe}px (1920x1080, GUI Scale {guiScale})
        </p>

        {lines.map((l, i) => {
          const pct = (l.width / scale) * 100;
          const over = l.width > safe;
          const warn = !over && l.width > safe * 0.85;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-gray-500 text-right shrink-0 font-mono">
                {l.label}
              </span>
              <div className="flex-1 h-3.5 bg-gray-200 dark:bg-neutral-800 rounded-sm relative overflow-hidden">
                <div
                  className={`h-full rounded-sm ${over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                <div
                  className="absolute top-0 h-full border-r border-dashed border-blue-400/40"
                  style={{ left: `${chestPct}%` }}
                />
                <div
                  className="absolute top-0 h-full border-r-2 border-dashed border-green-600/50"
                  style={{ left: `${safePct}%` }}
                />
              </div>
              <span
                className={`w-24 shrink-0 text-right tabular-nums ${over ? "text-red-500 font-semibold" : "text-gray-500"}`}
              >
                {l.width}/{safe}px
              </span>
            </div>
          );
        })}

        <div className="flex gap-4 text-[10px] text-gray-400 mt-0.5 pl-12">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0 border-t border-dashed border-blue-400" />{" "}
            Chest (176px)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0 border-t-2 border-dashed border-green-600" />{" "}
            Safe ({safe}px)
          </span>
        </div>
      </div>

      {overflow && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded px-3 py-2">
          ⚠ Some lines may overflow at GUI Scale {guiScale}. Consider adding
          line breaks to wrap long text.
        </p>
      )}
    </div>
  );
}
