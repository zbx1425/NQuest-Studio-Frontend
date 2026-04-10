"use client";

import { useState } from "react";
import {
  MessageBar,
  MessageBarBody,
} from "@fluentui/react-components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useGetAuditLogQuery } from "@/lib/store/api";
import { useTranslations } from "next-intl";
import { AuditFilters } from "@/components/admin/audit/AuditFilters";
import { AuditTable } from "@/components/admin/audit/AuditTable";
import { AuditDetailModal } from "@/components/admin/audit/AuditDetailModal";
import type { AuditLogEntry, AuditLogQuery } from "@/lib/types";

const PAGE_SIZE = 20;

const EMPTY_FILTERS: AuditLogQuery = {
  limit: PAGE_SIZE,
  offset: 0,
};

export default function AdminAuditPage() {
  const { isAdmin } = useAuth();
  const t = useTranslations("admin");

  const [filters, setFilters] = useState<AuditLogQuery>(EMPTY_FILTERS);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(
    null
  );

  const { data, isLoading } = useGetAuditLogQuery({
    ...filters,
    limit: PAGE_SIZE,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessageBar intent="warning">
          <MessageBarBody>{t("staffOnly")}</MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onChange={(f) => setFilters({ ...f, limit: PAGE_SIZE })}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      {/* Table */}
      <div className="mt-4">
        <AuditTable
          entries={data?.entries ?? []}
          total={data?.total ?? 0}
          pageSize={PAGE_SIZE}
          offset={filters.offset ?? 0}
          isLoading={isLoading}
          onOffsetChange={(offset) =>
            setFilters((prev) => ({ ...prev, offset }))
          }
          onSelectEntry={setSelectedEntry}
        />
      </div>

      {/* Detail Modal */}
      <AuditDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
