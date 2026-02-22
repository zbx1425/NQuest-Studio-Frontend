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
