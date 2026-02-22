"use client";

import { useState, useMemo } from "react";
import { Combobox, Option, Label } from "@fluentui/react-components";

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  items,
  placeholder,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return items.slice(0, 15);
    const matches = items
      .filter((item) => item.toLowerCase().includes(q) && item !== query)
      .slice(0, 15);
    if (query && !matches.includes(query)) {
      return [query, ...matches];
    }
    return matches;
  }, [items, query]);

  return (
    <div className="flex flex-col gap-1">
      <Label size="small">{label}</Label>
      <Combobox
        size="small"
        freeform
        value={query || value}
        selectedOptions={value ? [value] : []}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        onOptionSelect={(_, d) => {
          onChange(d.optionValue ?? "");
          setQuery("");
        }}
        placeholder={placeholder}
      >
        {filtered.map((item) => (
          <Option key={item} value={item}>
            {item}
          </Option>
        ))}
        {filtered.length === 0 && (
          <Option disabled value="">No results</Option>
        )}
      </Combobox>
    </div>
  );
}
