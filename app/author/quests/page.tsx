"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Tab,
  TabList,
  Dropdown,
  Option,
  Spinner,
  Badge,
  Text,
  Input,
  Checkbox,
} from "@fluentui/react-components";
import {
  AddRegular,
  EditRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  WarningRegular,
  SearchRegular,
  DismissRegular,
} from "@fluentui/react-icons";
import { useGetQuestsQuery, useGetCategoriesQuery } from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "" | "PRIVATE" | "STAGING" | "PUBLIC";

export default function QuestListPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthor, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetQuestsQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    page,
    size: pageSize,
  });

  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  let filteredItems = data?.items ?? [];
  if (pendingOnly) {
    filteredItems = filteredItems.filter((q) => q.hasPendingDraft);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    filteredItems = filteredItems.filter(
      (q) =>
        q.name.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query)
    );
  }
  const isClientFiltered = pendingOnly || !!searchQuery.trim();
  const totalItems = isClientFiltered ? filteredItems.length : (data?.total ?? 0);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Quests</h1>
        {isLoggedIn && isAuthor && (
          <Link href="/author/editor">
            <Button appearance="primary" icon={<AddRegular />}>
              New Quest
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          placeholder="Search by name or ID..."
          contentBefore={<SearchRegular />}
          contentAfter={
            searchQuery ? (
              <Button
                appearance="transparent"
                size="small"
                icon={<DismissRegular />}
                onClick={() => setSearchQuery("")}
              />
            ) : undefined
          }
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
          className="w-64"
        />

        <div className="self-stretch w-px bg-gray-200" />

        <TabList
          selectedValue={statusFilter}
          onTabSelect={(_, d) => {
            setStatusFilter(d.value as StatusFilter);
            setPage(1);
          }}
          size="small"
        >
          <Tab value="">All</Tab>
          <Tab value="PRIVATE">Private</Tab>
          <Tab value="STAGING">Staging</Tab>
          <Tab value="PUBLIC">Public</Tab>
        </TabList>

        <div className="self-stretch w-px bg-gray-200" />

        <Dropdown
          placeholder="All Categories"
          value={
            categoryFilter
              ? categories?.[categoryFilter]?.name ?? categoryFilter
              : "All Categories"
          }
          onOptionSelect={(_, d) => {
            setCategoryFilter(d.optionValue === "__all__" ? "" : (d.optionValue ?? ""));
            setPage(1);
          }}
          className="min-w-[160px]"
        >
          <Option value="__all__">All Categories</Option>
          {categoryEntries.map(([id, cat]) => (
            <Option key={id} value={id}>
              {cat.name}
            </Option>
          ))}
        </Dropdown>

        {isAdmin && (
          <>
            <div className="self-stretch w-px bg-gray-200" />
            <Checkbox
              label="Pending review only"
              checked={pendingOnly}
              onChange={(_, d) => {
                setPendingOnly(!!d.checked);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="large" label="Loading quests..." />
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold w-24">Status</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-right p-3 font-semibold w-16">Pts</th>
                  <th className="text-left p-3 font-semibold w-24">Draft</th>
                  <th className="text-left p-3 font-semibold w-32">Modified</th>
                  <th className="text-center p-3 font-semibold w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {searchQuery.trim()
                        ? "No quests matching your search."
                        : pendingOnly
                          ? "No quests pending review."
                          : "No quests found."}
                    </td>
                  </tr>
                )}
                {filteredItems.map((quest) => {
                  const catName = quest.category && categories
                    ? categories[quest.category]?.name ?? quest.category
                    : "—";
                  const tierName =
                    quest.tier && quest.category && categories
                      ? categories[quest.category]?.tiers[quest.tier]?.name ?? quest.tier
                      : quest.tier ?? "";

                  return (
                    <tr
                      key={quest.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <Link href={`/author/editor?id=${encodeURIComponent(quest.id)}`} className="block">
                          <div className="font-medium flex items-center gap-1.5">
                            {quest.hasPendingDraft && (
                              <WarningRegular className="text-amber-500" style={{ fontSize: 14 }} />
                            )}
                            {quest.name}
                          </div>
                          <Text size={200} className="text-gray-500">
                            {quest.id}
                          </Text>
                        </Link>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={quest.status} />
                      </td>
                      <td className="p-3">
                        <span>{catName}</span>
                        {tierName && (
                          <Text size={200} className="text-gray-500 ml-2">
                            {tierName}
                          </Text>
                        )}
                      </td>
                      <td className="p-3 text-right">{quest.questPoints}</td>
                      <td className="p-3">
                        {quest.hasPendingDraft && (
                          <Badge appearance="filled" color="warning" size="small">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-gray-500">
                        {formatDistanceToNow(new Date(quest.lastModifiedAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <Link href={`/author/editor?id=${encodeURIComponent(quest.id)}`}>
                          <Button
                            appearance="subtle"
                            icon={<EditRegular />}
                          />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                appearance="subtle"
                icon={<ChevronLeftRegular />}
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              />
              <Text size={300}>
                Page {page} of {totalPages} ({totalItems} quests)
              </Text>
              <Button
                appearance="subtle"
                icon={<ChevronRightRegular />}
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
