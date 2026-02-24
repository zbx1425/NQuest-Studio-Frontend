import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ActivityResponse,
  LeaderboardResponse,
  LeaderboardParams,
  SpeedrunResponse,
  SpeedrunParams,
  PlayerProfile,
  PlayerHistoryResponse,
  PlayerHistoryParams,
  PersonalBestsResponse,
  TransactionsResponse,
  TransactionParams,
  PublicQuestListResponse,
  PlayerSearchResponse,
  Quest,
  CategoriesMap,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1";

export const rankingApi = createApi({
  reducerPath: "rankingApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  endpoints: (builder) => ({
    getRecentActivity: builder.query<ActivityResponse, { limit?: number }>({
      query: (params) => ({ url: "/activity/recent", params }),
    }),

    getQpLeaderboard: builder.query<LeaderboardResponse, LeaderboardParams>({
      query: (params) => ({ url: "/leaderboards/qp", params }),
    }),

    getCompletionsLeaderboard: builder.query<
      LeaderboardResponse,
      LeaderboardParams
    >({
      query: (params) => ({ url: "/leaderboards/completions", params }),
    }),

    getSpeedrunLeaderboard: builder.query<SpeedrunResponse, SpeedrunParams>({
      query: ({ questId, ...params }) => ({
        url: `/leaderboards/speedrun/${encodeURIComponent(questId)}`,
        params,
      }),
    }),

    getPlayerProfile: builder.query<PlayerProfile, string>({
      query: (uuid) => `/players/${encodeURIComponent(uuid)}/profile`,
    }),

    getPlayerHistory: builder.query<
      PlayerHistoryResponse,
      PlayerHistoryParams
    >({
      query: ({ uuid, ...params }) => ({
        url: `/players/${encodeURIComponent(uuid)}/history`,
        params,
      }),
    }),

    getPlayerPersonalBests: builder.query<PersonalBestsResponse, string>({
      query: (uuid) => `/players/${encodeURIComponent(uuid)}/personal-bests`,
    }),

    getPlayerTransactions: builder.query<
      TransactionsResponse,
      TransactionParams
    >({
      query: ({ uuid, ...params }) => ({
        url: `/players/${encodeURIComponent(uuid)}/transactions`,
        params,
      }),
    }),

    getQuestDetail: builder.query<Quest, string>({
      query: (questId) => `/quests/${encodeURIComponent(questId)}`,
    }),

    getPublicQuests: builder.query<
      PublicQuestListResponse,
      { page?: number; size?: number }
    >({
      query: (params) => ({
        url: "/quests",
        params: { ...params, status: "PUBLIC" },
      }),
    }),

    getPublicCategories: builder.query<CategoriesMap, void>({
      query: () => "/categories",
    }),

    searchPlayers: builder.query<
      PlayerSearchResponse,
      { name: string; limit?: number }
    >({
      query: (params) => ({ url: "/players/search", params }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetRecentActivityQuery,
  useGetQpLeaderboardQuery,
  useGetCompletionsLeaderboardQuery,
  useGetSpeedrunLeaderboardQuery,
  useGetPlayerProfileQuery,
  useGetPlayerHistoryQuery,
  useGetPlayerPersonalBestsQuery,
  useGetPlayerTransactionsQuery,
  useGetQuestDetailQuery,
  useGetPublicQuestsQuery,
  useGetPublicCategoriesQuery,
  useSearchPlayersQuery,
} = rankingApi;
