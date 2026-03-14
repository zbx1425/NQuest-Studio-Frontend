"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Badge,
} from "@fluentui/react-components";
import {
  SearchRegular,
  DismissRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  TimerRegular,
  TrophyRegular,
  ArrowRightRegular,
  TagRegular,
  PeopleRegular,
} from "@fluentui/react-icons";
import {
  useGetPublicQuestsQuery,
  useGetPublicCategoriesQuery,
} from "@/lib/store/rankingApi";
import { ActivityFeed } from "@/components/ranking/ActivityFeed";
import { useTranslations } from "next-intl";
import type { PublicQuestListItem } from "@/lib/types";

const PAGE_SIZE = 18;

function QuestCard({ quest }: { quest: PublicQuestListItem }) {
  const t = useTranslations("quests");
  return (
    <Link
      href={`/ranking/quest?id=${encodeURIComponent(quest.id)}`}
      className="no-underline text-inherit"
    >
      <div className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
            {quest.name}
          </h3>
          <Badge
            appearance="tint"
            color="brand"
            size="medium"
            className="shrink-0"
          >
            {quest.questPoints} QP
          </Badge>
        </div>

        {quest.description ? (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">
            {quest.description}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mb-2 italic">{t("noDescription")}</p>
        )}

        <div className="mt-auto flex items-center gap-2 flex-wrap">
          {quest.category && (
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
              <TagRegular className="text-[11px]" />
              {quest.category}
              {quest.tier && (
                <span className="text-gray-400">/ {quest.tier}</span>
              )}
            </span>
          )}
          {quest.totalRuns != null && quest.totalRuns > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <PeopleRegular className="text-[11px]" />
              {t("runnerCount", { count: quest.uniqueRunners ?? 0 })}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 group-hover:text-blue-500 transition-colors ml-auto">
            <TimerRegular className="text-[11px]" />
            {t("leaderboard")}
            <ArrowRightRegular className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function QuestCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse shrink-0" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function PublicQuestsPage() {
  const t = useTranslations("quests");
  const tr = useTranslations("ranking");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categoriesMap } = useGetPublicCategoriesQuery();
  const categoryEntries = categoriesMap
    ? Object.entries(categoriesMap)
        .filter(([, c]) => !c.hidden)
        .sort(([, a], [, b]) => a.order - b.order)
    : [];

  const hiddenCategoryIds = useMemo(
    () =>
      categoriesMap
        ? new Set(
            Object.entries(categoriesMap)
              .filter(([, c]) => c.hidden)
              .map(([id]) => id)
          )
        : new Set<string>(),
    [categoriesMap]
  );

  const { data, isLoading } = useGetPublicQuestsQuery({
    size: 9999,
  });

  const filteredItems = useMemo(() => {
    let result = data?.items ?? [];

    result = result.filter(
      (q) => !q.category || !hiddenCategoryIds.has(q.category)
    );

    if (categoryFilter) {
      result = result.filter((q) => q.category === categoryFilter);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(query) ||
          q.id.toLowerCase().includes(query) ||
          (q.description && q.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [data, hiddenCategoryIds, categoryFilter, debouncedSearch]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const items = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Header */}
      <div className="relative rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="text-2xl sm:text-3xl items-center gap-2 mb-2 flex items-center">
            <TrophyRegular className="text-yellow-300" />
            <p className="font-bold">{t("questCatalog")}</p>
          </div>
          <p className="text-sm text-blue-100 max-w-lg">
            {t("questCatalogDesc")}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search & Filters */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Input
              placeholder={t("searchPlaceholder")}
              contentBefore={<SearchRegular />}
              contentAfter={
                searchQuery ? (
                  <Button
                    appearance="transparent"
                    size="small"
                    icon={<DismissRegular />}
                    onClick={() => { setSearchQuery(""); setPage(1); }}
                  />
                ) : undefined
              }
              value={searchQuery}
              onChange={(_, d) => { setSearchQuery(d.value); setPage(1); }}
              className="w-72"
            />
            {!isLoading && (
              <span className="text-sm text-gray-500">
                {debouncedSearch && categoryFilter && categoriesMap?.[categoryFilter]
                  ? t("questCountMatchingInCategory", { count: totalItems, search: debouncedSearch, category: categoriesMap[categoryFilter].name })
                  : debouncedSearch
                    ? t("questCountMatching", { count: totalItems, search: debouncedSearch })
                    : categoryFilter && categoriesMap?.[categoryFilter]
                      ? t("questCountInCategory", { count: totalItems, category: categoriesMap[categoryFilter].name })
                      : t("questCount", { count: totalItems })}
              </span>
            )}
          </div>

          {/* Category Chips */}
          {categoryEntries.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <button
                onClick={() => { setCategoryFilter(""); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  !categoryFilter
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t("allCategories")}
              </button>
              {categoryEntries.map(([id, cat]) => (
                <button
                  key={id}
                  onClick={() => { setCategoryFilter(categoryFilter === id ? "" : id); setPage(1); }}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    categoryFilter === id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 9 }, (_, i) => (
                <QuestCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center py-16 px-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <SearchRegular className="text-xl text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                {t("noQuestsFound")}
              </p>
              <p className="text-xs text-gray-500">
                {debouncedSearch || categoryFilter
                  ? t("tryDifferent")
                  : t("noPublicQuests")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                appearance="subtle"
                icon={<ChevronLeftRegular />}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              />
              <span className="text-sm text-gray-600 tabular-nums">
                {t("pageOfTotal", { page, total: totalPages, count: totalItems })}
              </span>
              <Button
                appearance="subtle"
                icon={<ChevronRightRegular />}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {tr("recentActivity")}
            </p>
            <ActivityFeed limit={10} />
          </div>
        </aside>
      </div>
    </div>
  );
}
