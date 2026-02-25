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
import { useDateLocale } from "@/lib/hooks/useDateLocale";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

type StatusFilter = "" | "PRIVATE" | "STAGING" | "PUBLIC";

export default function QuestListPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthor, isAdmin } = useAuth();
  const dateLocale = useDateLocale();
  const t = useTranslations("quests");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tNav = useTranslations("nav");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!isAuthor) {
      router.replace("/quests");
    }
  }, [isAuthor, router]);

  const { data: categories } = useGetCategoriesQuery(undefined, {
    skip: !isAuthor,
  });

  const {
    data: authData,
    isLoading: authLoading,
    isFetching: authFetching,
  } = useGetQuestsQuery(
    {
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      page,
      size: pageSize,
    },
    { skip: !isAuthor }
  );

  const isLoading = authLoading;
  const isFetching = authFetching;

  const categoryEntries = categories
    ? Object.entries(categories).sort(([, a], [, b]) => a.order - b.order)
    : [];

  let authItems = authData?.items ?? [];
  if (pendingOnly) {
    authItems = authItems.filter((q) => q.hasPendingDraft);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    authItems = authItems.filter(
      (q) =>
        q.name.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query)
    );
  }
  const isClientFiltered = pendingOnly || !!searchQuery.trim();
  const totalItems = isClientFiltered
    ? authItems.length
    : (authData?.total ?? 0);
  const totalPages = Math.ceil(totalItems / pageSize);

  if (!isAuthor) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{tNav("quests")}</h1>
        {isLoggedIn && isAuthor && (
          <Link href="/author/editor">
            <Button appearance="primary" icon={<AddRegular />}>
              {t("newQuest")}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          placeholder={t("searchByName")}
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
          onChange={(_, d) => { setSearchQuery(d.value); setPage(1); }}
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
          <Tab value="">{tCommon("all")}</Tab>
          <Tab value="PRIVATE">{tStatus("private")}</Tab>
          <Tab value="STAGING">{tStatus("staging")}</Tab>
          <Tab value="PUBLIC">{tStatus("public")}</Tab>
        </TabList>

        <div className="self-stretch w-px bg-gray-200" />

        <Dropdown
          placeholder={t("allCategories")}
          value={
            categoryFilter
              ? categories?.[categoryFilter]?.name ?? categoryFilter
              : t("allCategories")
          }
          onOptionSelect={(_, d) => {
            setCategoryFilter(d.optionValue === "__all__" ? "" : (d.optionValue ?? ""));
            setPage(1);
          }}
          className="min-w-[160px]"
        >
          <Option value="__all__">{t("allCategories")}</Option>
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
              label={t("pendingReviewOnly")}
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
          <Spinner size="large" label={t("loadingQuests")} />
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60">
                  <th className="text-left p-3 font-semibold">{t("name")}</th>
                  <th className="text-left p-3 font-semibold w-24">{t("status")}</th>
                  <th className="text-left p-3 font-semibold">{t("category")}</th>
                  <th className="text-right p-3 font-semibold w-16">{t("pts")}</th>
                  <th className="text-left p-3 font-semibold w-24">{t("draft")}</th>
                  <th className="text-left p-3 font-semibold w-32">{t("modified")}</th>
                  <th className="text-center p-3 font-semibold w-16"></th>
                </tr>
              </thead>
              <tbody>
                {authItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      {searchQuery.trim()
                        ? t("noQuestsMatch")
                        : pendingOnly
                          ? t("noQuestsPending")
                          : t("noQuestsFoundEmpty")}
                    </td>
                  </tr>
                )}
                {authItems.map((quest) => {
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
                            {tCommon("pending")}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-gray-500">
                        {formatDistanceToNow(new Date(quest.lastModifiedAt), {
                          addSuffix: true,
                          locale: dateLocale,
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                appearance="subtle"
                icon={<ChevronLeftRegular />}
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
              />
              <Text size={300}>
                {t("pageOfTotal", { page, total: totalPages, count: totalItems })}
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
