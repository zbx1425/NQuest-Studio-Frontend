// ─── Common ───

export interface UserRef {
  discordUserId: string;
  username: string;
}

export interface AclEntry {
  discordUserId: string;
  discordUsername: string | null;
  role: "OWNER" | "EDITOR";
}

export interface ApiError {
  error: string;
  message: string;
}

// ─── Criterion (discriminated union) ───

export interface Vec3d {
  x: number;
  y: number;
  z: number;
}

export interface ManualTriggerCriterion {
  type: "ManualTriggerCriterion";
  id: string;
  description: string;
}

export interface InBoundsCriterion {
  type: "InBoundsCriterion";
  min: Vec3d;
  max: Vec3d;
  description: string;
}

export interface OverSpeedCriterion {
  type: "OverSpeedCriterion";
  maxSpeedMps: number;
}

export interface TeleportDetectCriterion {
  type: "TeleportDetectCriterion";
}

export interface RideLineCriterion {
  type: "RideLineCriterion";
  lineName: string;
}

export interface VisitStationCriterion {
  type: "VisitStationCriterion";
  stationName: string;
}

export interface RideToStationCriterion {
  type: "RideToStationCriterion";
  stationName: string;
}

export interface RideLineToStationCriterion {
  type: "RideLineToStationCriterion";
  lineName: string;
  stationName: string;
}

export interface ConstantCriterion {
  type: "ConstantCriterion";
  value: boolean;
  description: string;
}

export interface Descriptor {
  type: "Descriptor";
  base: Criterion;
  description: string;
}

export interface AndCriterion {
  type: "AndCriterion";
  criteria: Criterion[];
}

export interface OrCriterion {
  type: "OrCriterion";
  criteria: Criterion[];
}

export interface NotCriterion {
  type: "NotCriterion";
  base: Criterion;
  description: string;
}

export interface LatchingCriterion {
  type: "LatchingCriterion";
  base: Criterion;
}

export interface RisingEdgeAndConditionCriterion {
  type: "RisingEdgeAndConditionCriterion";
  triggerCriteria: Criterion;
  conditionCriteria: Criterion;
}

export type Criterion =
  | ManualTriggerCriterion
  | InBoundsCriterion
  | RideLineCriterion
  | VisitStationCriterion
  | RideToStationCriterion
  | RideLineToStationCriterion
  | ConstantCriterion
  | OverSpeedCriterion
  | TeleportDetectCriterion
  | Descriptor
  | AndCriterion
  | OrCriterion
  | NotCriterion
  | LatchingCriterion
  | RisingEdgeAndConditionCriterion;

export type CriterionType = Criterion["type"];

export const CRITERION_TYPES: CriterionType[] = [
  "RideLineCriterion",
  "VisitStationCriterion",
  "RideToStationCriterion",
  "RideLineToStationCriterion",
  "ManualTriggerCriterion",
  "InBoundsCriterion",
  "OverSpeedCriterion",
  "TeleportDetectCriterion",
  "ConstantCriterion",
  "Descriptor",
  "AndCriterion",
  "OrCriterion",
  "NotCriterion",
  "LatchingCriterion",
  "RisingEdgeAndConditionCriterion",
];

// ─── Quest ───

export interface Step {
  criteria: Criterion;
  failureCriteria?: Criterion;
}

export interface DefaultCriteria {
  failureCriteria: Criterion;
}

export interface QuestData {
  steps: Step[];
  defaultCriteria: DefaultCriteria | null;
}

export interface Quest {
  id: string;
  status: "PRIVATE" | "STAGING" | "PUBLIC";
  name: string;
  description: string | null;
  category: string | null;
  tier: string | null;
  questPoints: number;
  dataDraft: QuestData;
  dataPublic?: QuestData;
  hasPendingDraft: boolean;
  createdBy: UserRef;
  createdAt: number;
  lastModifiedBy: UserRef;
  lastModifiedAt: number;
  acl: AclEntry[];
}

export interface QuestListItem {
  id: string;
  status: "PRIVATE" | "STAGING" | "PUBLIC";
  name: string;
  description: string | null;
  category: string | null;
  tier: string | null;
  questPoints: number;
  hasPendingDraft: boolean;
  createdBy: UserRef;
  lastModifiedAt: number;
  acl: AclEntry[];
}

export interface QuestListResponse {
  items: QuestListItem[];
  total: number;
  page: number;
  size: number;
}

// ─── Category ───

export interface QuestTier {
  name: string;
  icon: string;
  order: number;
}

export interface QuestCategory {
  name: string;
  description: string;
  icon: string;
  order: number;
  hidden: boolean;
  tiers: Record<string, QuestTier>;
}

export type CategoriesMap = Record<string, QuestCategory>;

// ─── Auth ───

export interface MeResponse {
  discordUserId: string;
  username: string;
  roles: string[];
  mcUuid: string | null;
}

// ─── System Map ───

export interface SystemMapData {
  stationNames: string[];
  routeNames: string[];
  stationNamesAndIds: string[];
  stationNameToId: Record<string, string>;
  stationIdToName: Record<string, string>;
}

// ─── Search (public) ───

export interface PlayerSearchResult {
  playerUuid: string;
  playerName: string;
}

export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
}

export interface PublicQuestListItem {
  id: string;
  name: string;
  questPoints: number;
  description?: string | null;
  category?: string | null;
  tier?: string | null;
  totalRuns?: number;
  uniqueRunners?: number;
}

export interface PublicQuestListResponse {
  items: PublicQuestListItem[];
  total: number;
}

// ─── Step Detail ───

export interface StepDetail {
  durationMillis: number;
  description: string | null;
  linesRidden: string[];
}

// ─── Ranking & Stats ───

export type TimePeriod = "all_time" | "monthly" | "weekly";
export type SpeedrunMode = "personal_best" | "all_runs";
export type TransactionType =
  | "QUEST_COMPLETION"
  | "QP_ADJUSTMENT"
  | "SPEND"
  | "ADMIN_GRANT"
  | "ADMIN_DEDUCT"
  | "EARN"
  | "DISQUALIFY";

export interface DisqualifyResponse {
  completionId: number;
  playerUuid: string;
  qpDeducted: number;
  newBalance: number;
}

export interface QpOperationResponse {
  transactionId: number;
  newBalance: number;
}

export interface ActivityEntry {
  playerUuid: string;
  playerName: string;
  questId: string;
  questName: string;
  durationMillis: number;
  completionTime: number;
  questPoints: number;
  isPersonalBest: boolean;
  isWorldRecord: boolean;
}

export interface ActivityResponse {
  entries: ActivityEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  playerUuid: string;
  playerName: string;
  value: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  period: TimePeriod;
}

export interface LeaderboardParams {
  period?: TimePeriod;
  limit?: number;
  offset?: number;
}

export interface SpeedrunEntry {
  rank: number;
  playerUuid: string;
  playerName: string;
  durationMillis: number;
  completionTime: number;
  completionId: number;
  isWorldRecord: boolean;
  stepDetails: Record<string, StepDetail> | null;
}

export interface SpeedrunResponse {
  entries: SpeedrunEntry[];
  total: number;
  quest: { id: string; name: string; questPoints: number };
}

export interface SpeedrunParams {
  questId: string;
  period?: TimePeriod;
  mode?: SpeedrunMode;
  limit?: number;
  offset?: number;
}

export interface PlayerProfile {
  playerUuid: string;
  playerName: string;
  qpBalance: number;
  totalQpEarned: number;
  totalQpSpent: number;
  totalQuestCompletions: number;
  personalBestCount: number;
  worldRecordCount: number;
  firstCompletionTime: number | null;
  recentActivity: {
    questId: string;
    questName: string;
    durationMillis: number;
    completionTime: number;
    isPersonalBest: boolean;
  }[];
}

export interface PlayerHistoryEntry {
  completionId: number;
  questId: string;
  questName: string;
  completionTime: number;
  durationMillis: number;
  questPoints: number;
  stepDetails: Record<string, StepDetail> | null;
  isPersonalBest: boolean;
  disqualified: boolean;
}

export interface PlayerHistoryResponse {
  player: { playerUuid: string; playerName: string };
  entries: PlayerHistoryEntry[];
  total: number;
}

export interface PlayerHistoryParams {
  uuid: string;
  limit?: number;
  offset?: number;
}

export interface PersonalBestEntry {
  questId: string;
  questName: string;
  durationMillis: number;
  completionTime: number;
  rank: number;
}

export interface PersonalBestsResponse {
  entries: PersonalBestEntry[];
}

export interface TransactionEntry {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  questId: string | null;
  completionId: number | null;
  createdAt: number;
}

export interface TransactionsResponse {
  entries: TransactionEntry[];
  total: number;
}

export interface TransactionParams {
  uuid: string;
  type?: TransactionType;
  limit?: number;
  offset?: number;
}

export interface StepAnalytic {
  stepIndex: number;
  description: string | null;
  avgDurationMillis: number | null;
  medianDurationMillis: number | null;
}

export interface QuestStatsResponse {
  questId: string;
  questName: string;
  totalRuns: number;
  uniqueRunners: number;
  averageDurationMillis: number | null;
  medianDurationMillis: number | null;
  worldRecord: {
    playerUuid: string;
    playerName: string;
    durationMillis: number;
    completionTime: number;
  } | null;
  stepAnalytics: StepAnalytic[];
}

export interface AdjustQpResponse {
  jobId: string;
  affectedCompletions: number;
  qpDeltaPerCompletion: number;
  status: string;
}

export interface JobStatusResponse {
  jobId: string;
  type: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  progress: { processed: number; total: number };
  createdAt: number;
  completedAt: number | null;
}
