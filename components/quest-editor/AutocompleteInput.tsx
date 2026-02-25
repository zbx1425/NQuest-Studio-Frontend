"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Combobox,
  Option,
  Label,
  Text,
} from "@fluentui/react-components";
import type { OptionOnSelectData } from "@fluentui/react-components";
import { useTranslations } from "next-intl";

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
  /** Maps stored values (e.g. internal IDs) to human-friendly display names */
  displayMap?: Record<string, string>;
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  items,
  placeholder,
  displayMap,
}: AutocompleteInputProps) {
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const committedRef = useRef(false);

  const displayValue = useMemo(() => {
    if (!value) return "";
    return displayMap?.[value] ?? value;
  }, [value, displayMap]);

  const shownValue = open ? inputText : displayValue;

  const filtered = useMemo(() => {
    const q = inputText.toLowerCase();
    if (!q) return items.slice(0, 50);
    return items
      .filter((item) => {
        const friendly = displayMap?.[item];
        const searchable = friendly
          ? `${item} ${friendly}`.toLowerCase()
          : item.toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, 50);
  }, [items, inputText, displayMap]);

  const showCustomOption =
    open &&
    inputText &&
    !items.includes(inputText) &&
    filtered.every((i) => i !== inputText);

  const handleOptionSelect = useCallback(
    (_: unknown, data: OptionOnSelectData) => {
      if (!data.optionValue) return;
      onChange(data.optionValue);
      committedRef.current = true;
      setInputText("");
      setOpen(false);
    },
    [onChange],
  );

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const text = (e.target as HTMLInputElement).value;
      setInputText(text);
      if (!open) setOpen(true);
    },
    [open],
  );

  const handleOpenChange = useCallback(
    (_: unknown, data: { open: boolean }) => {
      setOpen(data.open);
      if (data.open) {
        setInputText("");
        committedRef.current = false;
      }
    },
    [],
  );

  const inputTextRef = useRef(inputText);
  inputTextRef.current = inputText;
  const displayValueRef = useRef(displayValue);
  displayValueRef.current = displayValue;

  const handleBlur = useCallback(() => {
    const text = inputTextRef.current;
    const display = displayValueRef.current;
    if (!committedRef.current && text && text !== display) {
      const exactMatch = items.find((item) => {
        const friendly = displayMap?.[item];
        return item === text || friendly === text;
      });
      onChange(exactMatch ?? text);
    }
    committedRef.current = false;
    setInputText("");
    setOpen(false);
  }, [items, displayMap, onChange]);

  const selectedOptions = useMemo(() => (value ? [value] : []), [value]);

  return (
    <div className="flex flex-col gap-1">
      <Label size="small">{label}</Label>
      <Combobox
        size="small"
        freeform
        open={open}
        value={shownValue}
        selectedOptions={selectedOptions}
        onOpenChange={handleOpenChange}
        onInput={handleInput}
        onOptionSelect={handleOptionSelect}
        onBlur={handleBlur}
        placeholder={placeholder}
      >
        {showCustomOption && (
          <Option key="__custom" value={inputText} text={inputText}>
            <Text size={200} italic>
              Use &ldquo;{inputText}&rdquo;
            </Text>
          </Option>
        )}
        {filtered.map((item) => {
          const friendly = displayMap?.[item];
          return (
            <Option key={item} value={item} text={friendly ?? item}>
              {friendly && friendly !== item ? (
                <span>
                  {friendly}{" "}
                  <Text size={200} className="text-gray-400">
                    {item}
                  </Text>
                </span>
              ) : (
                item
              )}
            </Option>
          );
        })}
        {!showCustomOption && filtered.length === 0 && (
          <Option disabled value="">
            {tc("noResults")}
          </Option>
        )}
      </Combobox>
    </div>
  );
}
