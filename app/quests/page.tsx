"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Button,
  Input,
  Badge,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
  MenuItemRadio,
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
  PersonRegular,
  FilterRegular,
  ArrowSortRegular,
  CompassNorthwestRegular,
  VehicleSubwayRegular,
  ArrowCircleUpRegular,
  PuzzlePieceRegular,
  MusicNote2Regular,
  FireRegular,
} from "@fluentui/react-icons";
import {
  useGetPublicQuestsQuery,
  useGetPublicCategoriesQuery,
} from "@/lib/store/rankingApi";
import { ActivityFeed } from "@/components/ranking/ActivityFeed";
import { useTranslations } from "next-intl";
import type { PublicQuestListItem } from "@/lib/types";

const PAGE_SIZE = 18;

type SortMode = "shuffle" | "recent" | "qp_desc" | "qp_asc" | "name_asc";

const SORT_MODES: SortMode[] = [
  "shuffle",
  "recent",
  "qp_desc",
  "qp_asc",
  "name_asc",
];

const SORT_I18N_KEYS: Record<SortMode, string> = {
  shuffle: "sortShuffle",
  recent: "sortRecent",
  qp_desc: "sortQpDesc",
  qp_asc: "sortQpAsc",
  name_asc: "sortNameAsc",
};

const TIER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  travel: CompassNorthwestRegular,
  ride_along: VehicleSubwayRegular,
  parkour: ArrowCircleUpRegular,
  puzzle: PuzzlePieceRegular,
  variety: MusicNote2Regular,
  torture: FireRegular,
};

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  let t = (hash >>> 0) + 0x6d2b79f5;
  for (let i = copy.length - 1; i > 0; i--) {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function FilterChip({
  selected,
  onClick,
  children,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
        selected
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

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
          <p className="text-xs text-gray-400 mb-2 italic">
            {t("noDescription")}
          </p>
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
          {quest.createdBy?.username && (
            <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
              <PersonRegular className="text-[11px]" />
              {quest.createdBy.username}
            </span>
          )}
          {quest.totalRuns != null && quest.totalRuns > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <PeopleRegular className="text-[11px]" />
              {t("runnerCount", { count: quest.uniqueRunners ?? 0 })}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 group-hover:text-blue-500 transition-colors ml-auto">
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
  const [tierFilter, setTierFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("shuffle");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dailySeed = useMemo(() => new Date().toDateString(), []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const { data: categoriesMap } = useGetPublicCategoriesQuery();

  const categoryEntries = useMemo(
    () =>
      categoriesMap
        ? Object.entries(categoriesMap)
            .filter(([, c]) => !c.hidden)
            .sort(([, a], [, b]) => a.order - b.order)
        : [],
    [categoriesMap]
  );

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

  const tierEntries = useMemo(() => {
    if (!categoryEntries.length) return [];
    const tiers = categoryEntries[0][1].tiers;
    if (!tiers) return [];
    return Object.entries(tiers).sort(([, a], [, b]) => a.order - b.order);
  }, [categoryEntries]);

  const { data, isLoading } = useGetPublicQuestsQuery({ size: 9999 });

  const authorList = useMemo(() => {
    if (!data?.items) return [];
    const seen = new Map<string, string>();
    for (const q of data.items) {
      if (q.createdBy?.username) {
        seen.set(q.createdBy.username, q.createdBy.username);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let result = data?.items ?? [];

    result = result.filter(
      (q) => !q.category || !hiddenCategoryIds.has(q.category)
    );

    if (categoryFilter) {
      result = result.filter((q) => q.category === categoryFilter);
    }
    if (tierFilter) {
      result = result.filter((q) => q.tier === tierFilter);
    }
    if (authorFilter) {
      result = result.filter((q) => q.createdBy?.username === authorFilter);
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

    switch (sortMode) {
      case "shuffle":
        result = seededShuffle(result, dailySeed);
        break;
      case "recent":
        result = [...result].sort(
          (a, b) => (b.lastModifiedAt ?? 0) - (a.lastModifiedAt ?? 0)
        );
        break;
      case "qp_desc":
        result = [...result].sort((a, b) => b.questPoints - a.questPoints);
        break;
      case "qp_asc":
        result = [...result].sort((a, b) => a.questPoints - b.questPoints);
        break;
      case "name_asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [
    data,
    hiddenCategoryIds,
    categoryFilter,
    tierFilter,
    authorFilter,
    debouncedSearch,
    sortMode,
    dailySeed,
  ]);

  const totalItems = filteredAndSorted.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const items = filteredAndSorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const activeFilterCount =
    (categoryFilter ? 1 : 0) +
    (tierFilter ? 1 : 0) +
    (authorFilter ? 1 : 0) +
    (sortMode !== "shuffle" ? 1 : 0);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearAllFilters = useCallback(() => {
    setCategoryFilter("");
    setTierFilter("");
    setAuthorFilter("");
    setSortMode("shuffle");
    setPage(1);
  }, []);

  const categoryChips = (
    <>
      <FilterChip
        selected={!categoryFilter}
        onClick={() => {
          setCategoryFilter("");
          setPage(1);
        }}
      >
        {t("allCategories")}
      </FilterChip>
      {categoryEntries.map(([id, cat]) => (
        <FilterChip
          key={id}
          selected={categoryFilter === id}
          onClick={() => {
            setCategoryFilter(categoryFilter === id ? "" : id);
            setPage(1);
          }}
        >
          {cat.name.replaceAll("Quests", "")}
        </FilterChip>
      ))}
    </>
  );

  const tierChips = (
    <>
      <FilterChip
        selected={!tierFilter}
        onClick={() => {
          setTierFilter("");
          setPage(1);
        }}
      >
        {t("allTypes")}
      </FilterChip>
      {tierEntries.map(([id, tier]) => {
        const Icon = TIER_ICONS[id];
        return (
          <FilterChip
            key={id}
            selected={tierFilter === id}
            onClick={() => {
              setTierFilter(tierFilter === id ? "" : id);
              setPage(1);
            }}
            icon={Icon ? <Icon className="text-[11px]" /> : undefined}
          >
            {tier.name}
          </FilterChip>
        );
      })}
    </>
  );

  const authorChips = (
    <>
      <FilterChip
        selected={!authorFilter}
        onClick={() => {
          setAuthorFilter("");
          setPage(1);
        }}
      >
        {t("allAuthors")}
      </FilterChip>
      {authorList.map((author) => (
        <FilterChip
          key={author}
          selected={authorFilter === author}
          onClick={() => {
            setAuthorFilter(authorFilter === author ? "" : author);
            setPage(1);
          }}
        >
          {author}
        </FilterChip>
      ))}
    </>
  );

  const sortChips = SORT_MODES.map((mode) => (
    <FilterChip
      key={mode}
      selected={sortMode === mode}
      onClick={() => {
        setSortMode(mode);
        setPage(1);
      }}
    >
      {t(SORT_I18N_KEYS[mode])}
    </FilterChip>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-cyan-50/60">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.16),rgba(14,165,233,0)_70%)]" />
          <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),rgba(16,185,129,0)_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(25deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:34px_34px,46px_46px]" />
        </div>

        <div className="relative p-3 sm:p-5">
          <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-3">

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-amber-500 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.9)]">
                  <TrophyRegular className="text-xl" />
                </div>
                <div className="min-w-0 ms-2">
                  <p className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                    {t("questCatalog")}
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                    {t("questCatalogDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search row */}
          <div className="flex items-center gap-3 mb-3">
            <Input
              placeholder={t("searchPlaceholder")}
              contentBefore={<SearchRegular />}
              contentAfter={
                searchQuery ? (
                  <Button
                    appearance="transparent"
                    size="small"
                    icon={<DismissRegular />}
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                  />
                ) : undefined
              }
              value={searchQuery}
              onChange={(_, d) => {
                setSearchQuery(d.value);
                setPage(1);
              }}
              className="flex-1 lg:w-72 lg:flex-none"
            />

            {/* Mobile: filter button */}
            <button
              className="lg:hidden shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <FilterRegular />
              {t("filters")}
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop: Sort + Author menus */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <Menu
                checkedValues={{ author: [authorFilter || "__all__"] }}
                onCheckedValueChange={(_, { name, checkedItems }) => {
                  if (name === "author") {
                    const val = checkedItems[0];
                    setAuthorFilter(val === "__all__" ? "" : val);
                    setPage(1);
                  }
                }}
              >
                <MenuTrigger disableButtonEnhancement>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <PersonRegular className="text-sm" />
                    {authorFilter || t("allAuthors")}
                  </button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItemRadio name="author" value="__all__">
                      {t("allAuthors")}
                    </MenuItemRadio>
                    {authorList.map((author) => (
                      <MenuItemRadio
                        key={author}
                        name="author"
                        value={author}
                      >
                        {author}
                      </MenuItemRadio>
                    ))}
                  </MenuList>
                </MenuPopover>
              </Menu>

              <Menu
                checkedValues={{ sort: [sortMode] }}
                onCheckedValueChange={(_, { name, checkedItems }) => {
                  if (name === "sort" && checkedItems[0]) {
                    setSortMode(checkedItems[0] as SortMode);
                    setPage(1);
                  }
                }}
              >
                <MenuTrigger disableButtonEnhancement>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ArrowSortRegular className="text-sm" />
                    {t(SORT_I18N_KEYS[sortMode])}
                  </button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {SORT_MODES.map((mode) => (
                      <MenuItemRadio key={mode} name="sort" value={mode}>
                        {t(SORT_I18N_KEYS[mode])}
                      </MenuItemRadio>
                    ))}
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
          </div>

          {/* Desktop: Category chips */}
          {categoryEntries.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 mb-2 flex-wrap">
              {categoryChips}
            </div>
          )}

          {/* Desktop: Tier chips */}
          {tierEntries.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 mb-3 flex-wrap">
              {tierChips}
            </div>
          )}

          {/* Count + clear */}
          {!isLoading && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-gray-500">
                {debouncedSearch
                  ? t("questCountMatching", {
                      count: totalItems,
                      search: debouncedSearch,
                    })
                  : t("questCount", { count: totalItems })}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {t("clearFilters")}
                </button>
              )}
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
                {debouncedSearch ||
                categoryFilter ||
                tierFilter ||
                authorFilter
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
                onClick={() => handlePageChange(page - 1)}
              />
              <span className="text-sm text-gray-600 tabular-nums">
                {t("pageOfTotal", {
                  page,
                  total: totalPages,
                  count: totalItems,
                })}
              </span>
              <Button
                appearance="subtle"
                icon={<ChevronRightRegular />}
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
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

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-out flex flex-col ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <span className="text-sm font-semibold text-gray-800">
              {t("filters")}
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <DismissRegular className="text-lg text-gray-500" />
            </button>
          </div>

          {/* Drawer body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Sort */}
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t("filterSort")}
              </p>
              <div className="flex flex-wrap gap-1.5">{sortChips}</div>
            </div>

            {/* Duration */}
            {categoryEntries.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t("filterDuration")}
                </p>
                <div className="flex flex-wrap gap-1.5">{categoryChips}</div>
              </div>
            )}

            {/* Type */}
            {tierEntries.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t("filterType")}
                </p>
                <div className="flex flex-wrap gap-1.5">{tierChips}</div>
              </div>
            )}

            {/* Author */}
            {authorList.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t("filterAuthor")}
                </p>
                <div className="flex flex-wrap gap-1.5">{authorChips}</div>
              </div>
            )}
          </div>

          {/* Drawer footer */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-xs text-gray-500">
              {t("questCount", { count: totalItems })}
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
