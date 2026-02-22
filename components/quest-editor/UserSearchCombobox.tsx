"use client";

import { useState, useEffect, useRef } from "react";
import { Combobox, Option, Label } from "@fluentui/react-components";
import { useLazySearchUsersQuery } from "@/lib/store/api";
import type { UserRef } from "@/lib/types";

interface UserSearchComboboxProps {
  label?: string;
  onSelect: (user: UserRef) => void;
  excludeIds?: string[];
}

export function UserSearchCombobox({
  label = "Search users",
  onSelect,
  excludeIds = [],
}: UserSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [trigger, { data: results, isFetching }] = useLazySearchUsersQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        trigger({ q: query, limit: 10 });
      }, 300);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, trigger]);

  const filtered = (results ?? []).filter(
    (u) => !excludeIds.includes(u.discordUserId)
  );

  return (
    <div className="flex flex-col gap-1">
      {label && <Label size="small">{label}</Label>}
      <Combobox
        freeform
        size="small"
        placeholder="Type username or Discord ID..."
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        onOptionSelect={(_, d) => {
          const userId = d.optionValue ?? "";
          const user = filtered.find((u) => u.discordUserId === userId);
          if (user) {
            onSelect(user);
            setQuery("");
          } else if (userId) {
            onSelect({ discordUserId: userId, username: userId });
            setQuery("");
          }
        }}
      >
        {isFetching && <Option disabled value="">Searching...</Option>}
        {!isFetching && query.length >= 2 && filtered.length === 0 && (
          <Option disabled value="">No users found</Option>
        )}
        {filtered.map((user) => (
          <Option
            key={user.discordUserId}
            value={user.discordUserId}
            text={user.username}
          >
            <span className="font-medium">{user.username}</span>
            <span className="text-gray-500 ml-2 text-xs">
              {user.discordUserId}
            </span>
          </Option>
        ))}
        {query.length >= 2 && !filtered.find((u) => u.discordUserId === query) && (
          <Option value={query} text={query}>
            Use &quot;{query}&quot; as Discord User ID
          </Option>
        )}
      </Combobox>
    </div>
  );
}
