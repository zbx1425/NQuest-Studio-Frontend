import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import type {
  Quest,
  QuestListResponse,
  CategoriesMap,
  QuestCategory,
  AclEntry,
  MeResponse,
  UserRef,
  AdjustQpResponse,
  JobStatusResponse,
  QuestStatsResponse,
  DisqualifyResponse,
  QpOperationResponse,
  BanRequest,
  BanResponse,
  PardonResponse,
  ListBansResponse,
  ActiveBansResponse,
  AdminPlayerSearchResponse,
  InfractionsResponse,
  AuditLogResponse,
  AuditLogQuery,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Quest", "QuestList", "Category", "Acl", "Me", "PlayerBans"],
  endpoints: (builder) => ({
    // ─── Auth ───
    getMe: builder.query<MeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),
    bindMc: builder.mutation<{ mcUuid: string }, { token: string }>({
      query: (body) => ({ url: "/auth/bind-mc", method: "POST", body }),
      invalidatesTags: ["Me"],
    }),
    unbindMc: builder.mutation<void, void>({
      query: () => ({ url: "/auth/bind-mc", method: "DELETE" }),
      invalidatesTags: ["Me"],
    }),

    // ─── Quests ───
    getQuests: builder.query<
      QuestListResponse,
      { status?: string; category?: string; page?: number; size?: number }
    >({
      query: (params) => ({ url: "/quests", params }),
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ id }) => ({
              type: "Quest" as const,
              id,
            })),
            "QuestList",
          ]
          : ["QuestList"],
    }),
    getQuest: builder.query<Quest, string>({
      query: (id) => `/quests/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Quest", id }],
    }),
    createQuest: builder.mutation<
      Quest,
      {
        id: string;
        name: string;
        description?: string;
        category?: string;
        tier?: string;
        questPoints?: number;
        excludeFirstStep?: boolean;
        steps?: Quest["dataDraft"]["steps"];
        defaultCriteria?: Quest["dataDraft"]["defaultCriteria"];
      }
    >({
      query: (body) => ({ url: "/quests", method: "POST", body }),
      invalidatesTags: ["QuestList"],
    }),
    updateQuest: builder.mutation<
      Quest,
      {
        id: string;
        name: string;
        description?: string | null;
        category?: string | null;
        tier?: string | null;
        excludeFirstStep?: boolean;
        steps?: Quest["dataDraft"]["steps"];
        defaultCriteria?: Quest["dataDraft"]["defaultCriteria"];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/quests/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Quest", id },
        "QuestList",
      ],
    }),
    deleteQuest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quests/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QuestList"],
    }),
    updateQuestStatus: builder.mutation<
      Quest,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/quests/${encodeURIComponent(id)}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Quest", id },
        "QuestList",
      ],
    }),
    promoteQuest: builder.mutation<Quest, string>({
      query: (id) => ({
        url: `/quests/${encodeURIComponent(id)}/promote`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Quest", id },
        "QuestList",
      ],
    }),

    getQuestStats: builder.query<QuestStatsResponse, { questId: string; durationType?: 'ranking' | 'total' }>({
      query: ({ questId, durationType }) => ({
        url: `/quests/${encodeURIComponent(questId)}/stats`,
        params: durationType ? { durationType } : undefined,
      }),
    }),

    // ─── ACL ───
    getAcl: builder.query<AclEntry[], string>({
      query: (questId) =>
        `/quests/${encodeURIComponent(questId)}/acl`,
      providesTags: (_result, _error, questId) => [
        { type: "Acl", id: questId },
      ],
    }),
    updateAcl: builder.mutation<
      AclEntry[],
      {
        questId: string;
        acl: { discordUserId: string; role: "OWNER" | "EDITOR" }[];
      }
    >({
      query: ({ questId, acl }) => ({
        url: `/quests/${encodeURIComponent(questId)}/acl`,
        method: "PUT",
        body: acl,
      }),
      invalidatesTags: (_result, _error, { questId }) => [
        { type: "Acl", id: questId },
        { type: "Quest", id: questId },
        "QuestList",
      ],
    }),

    // ─── Categories ───
    getCategories: builder.query<CategoriesMap, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<
      QuestCategory,
      { id: string } & QuestCategory
    >({
      query: ({ id, ...body }) => ({
        url: "/categories",
        method: "POST",
        body: { id, ...body },
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<
      QuestCategory,
      { id: string } & QuestCategory
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ─── User Search ───
    searchUsers: builder.query<UserRef[], { q: string; limit?: number }>({
      query: (params) => ({ url: "/users/search", params }),
      keepUnusedDataFor: 30,
    }),

    // ─── Admin: QP Adjustment ───
    adjustQuestQp: builder.mutation<
      AdjustQpResponse,
      { questId: string; newQuestPoints: number; reason: string }
    >({
      query: ({ questId, ...body }) => ({
        url: `/admin/quests/${encodeURIComponent(questId)}/adjust-qp`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { questId }) => [
        { type: "Quest", id: questId },
      ],
    }),
    getJobStatus: builder.query<JobStatusResponse, string>({
      query: (jobId) => `/admin/jobs/${encodeURIComponent(jobId)}`,
    }),

    // ─── Admin: Disqualify / Grant / Deduct ───
    disqualifyCompletion: builder.mutation<
      DisqualifyResponse,
      { completionId: number; reason: string }
    >({
      query: ({ completionId, reason }) => ({
        url: `/admin/completions/${completionId}/disqualify`,
        method: "POST",
        body: { reason },
      }),
    }),
    adminGrantQp: builder.mutation<
      QpOperationResponse,
      { uuid: string; amount: number; reason: string }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/grant`,
        method: "POST",
        body,
      }),
    }),
    adminDeductQp: builder.mutation<
      QpOperationResponse,
      { uuid: string; amount: number; reason: string }
    >({
      query: ({ uuid, ...body }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/deduct`,
        method: "POST",
        body,
      }),
    }),

    // ─── Admin: Ban / Pardon ───
    banPlayer: builder.mutation<BanResponse, { uuid: string } & BanRequest>({
      query: ({ uuid, ...body }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/ban`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { uuid }) => [
        { type: "PlayerBans", id: uuid },
      ],
    }),
    pardonPlayer: builder.mutation<
      PardonResponse,
      { uuid: string; reason: string }
    >({
      query: ({ uuid, reason }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/pardon`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { uuid }) => [
        { type: "PlayerBans", id: uuid },
      ],
    }),
    getPlayerBans: builder.query<
      ListBansResponse,
      { uuid: string; limit?: number; offset?: number; active?: boolean }
    >({
      query: ({ uuid, ...params }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/bans`,
        params,
      }),
      providesTags: (_r, _e, { uuid }) => [{ type: "PlayerBans", id: uuid }],
    }),
    getPlayerInfractions: builder.query<
      InfractionsResponse,
      { uuid: string; limit?: number; offset?: number }
    >({
      query: ({ uuid, ...params }) => ({
        url: `/admin/players/${encodeURIComponent(uuid)}/infractions`,
        params,
      }),
      providesTags: (_r, _e, { uuid }) => [{ type: "PlayerBans", id: uuid }],
    }),
    getAdminBans: builder.query<
      ActiveBansResponse,
      { search?: string; limit?: number; offset?: number }
    >({
      query: (params) => ({
        url: "/admin/bans",
        params: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
        ),
      }),
      providesTags: ["PlayerBans"],
    }),
    searchAdminPlayers: builder.query<
      AdminPlayerSearchResponse,
      { name: string; limit?: number }
    >({
      query: (params) => ({
        url: "/admin/players/search",
        params,
      }),
      keepUnusedDataFor: 30,
    }),

    // ─── Admin: Audit Log ───
    getAuditLog: builder.query<AuditLogResponse, AuditLogQuery>({
      query: (params) => ({
        url: "/admin/audit-log",
        params: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
        ),
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useBindMcMutation,
  useUnbindMcMutation,
  useGetQuestsQuery,
  useGetQuestQuery,
  useCreateQuestMutation,
  useUpdateQuestMutation,
  useDeleteQuestMutation,
  useUpdateQuestStatusMutation,
  usePromoteQuestMutation,
  useGetAclQuery,
  useUpdateAclMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useLazySearchUsersQuery,
  useGetQuestStatsQuery,
  useAdjustQuestQpMutation,
  useLazyGetJobStatusQuery,
  useDisqualifyCompletionMutation,
  useAdminGrantQpMutation,
  useAdminDeductQpMutation,
  useBanPlayerMutation,
  usePardonPlayerMutation,
  useGetPlayerBansQuery,
  useGetPlayerInfractionsQuery,
  useGetAdminBansQuery,
  useLazySearchAdminPlayersQuery,
  useGetAuditLogQuery,
} = api;
