"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Tab,
  TabList,
  Dropdown,
  Option,
  Spinner,
  Badge,
  Text,
} from "@fluentui/react-components";
import {
  AddRegular,
  EditRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from "@fluentui/react-icons";
import { useGetQuestsQuery, useGetCategoriesQuery } from "@/lib/store/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";

type StatusFilter = "" | "PRIVATE" | "STAGING" | "PUBLIC";

export default function QuestListPage() {
  const { isLoggedIn, isAuthor } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetQuestsQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    page,
    size: pageSize,
  });

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {isLoggedIn && isAuthor && (
          <Link href="/editor">
            <Button appearance="primary" icon={<AddRegular />}>
              New Quest
            </Button>
          </Link>
        )}

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
          size="small"
          className="min-w-[160px]"
        >
          <Option value="__all__">All Categories</Option>
          {categoryEntries.map(([id, cat]) => (
            <Option key={id} value={id}>
              {cat.name}
            </Option>
          ))}
        </Dropdown>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="large" label="Loading quests..." />
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
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
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No quests found.
                    </td>
                  </tr>
                )}
                {data?.items.map((quest) => {
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
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <Link href={`/editor?id=${encodeURIComponent(quest.id)}`} className="block">
                          <div className="font-medium">{quest.name}</div>
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
                        <Link href={`/editor?id=${encodeURIComponent(quest.id)}`}>
                          <Button
                            appearance="subtle"
                            icon={<EditRegular />}
                            size="small"
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
                size="small"
              />
              <Text size={300}>
                Page {page} of {totalPages} ({data?.total} quests)
              </Text>
              <Button
                appearance="subtle"
                icon={<ChevronRightRegular />}
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
                size="small"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
