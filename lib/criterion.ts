import { v4 as uuidv4 } from "uuid";
import type { Criterion, CriterionType, Step } from "./types";

export type CriterionTypeGroupType =
  | "mtr"
  | "misc"
  | "logic";

export interface CriterionTypeGroup {
  type: CriterionTypeGroupType;
  children: CriterionType[];
}

export const GROUPED_ORDERED_CRITERION_TYPES: CriterionTypeGroup[] = [
  {
    type: "mtr",
    children: [
      "VisitStationCriterion", "RideLineCriterion", "RideToStationCriterion", 
      "RideLineToStationCriterion", "RideFromStationCriterion", "RideLineFromStationCriterion"
    ],
  },
  {
    type: "misc",
    children: [
      "ManualTriggerCriterion", "InBoundsCriterion", "TeleportDetectCriterion",
      "OverSpeedCriterion", 
    ],
  },
  {
    type: "logic",
    children: [
      "ConstantCriterion", "Descriptor", "NotCriterion",
      "AndCriterion", "OrCriterion", "SequenceCriterion", 
      "LatchingCriterion", "RisingEdgeAndConditionCriterion"
    ],
  },
];

export function createDefaultCriterion(type: CriterionType): Criterion {
  switch (type) {
    case "ManualTriggerCriterion":
      return { type: "ManualTriggerCriterion", id: "choose-a-meaningful-name-" + uuidv4().substring(0, 8), description: "" };
    case "OverSpeedCriterion":
      return { type: "OverSpeedCriterion", maxSpeedMps: 0 };
    case "TeleportDetectCriterion":
      return { type: "TeleportDetectCriterion" };
    case "InBoundsCriterion":
      return {
        type: "InBoundsCriterion",
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
        description: "",
      };
    case "RideLineCriterion":
      return { type: "RideLineCriterion", lineName: "" };
    case "VisitStationCriterion":
      return { type: "VisitStationCriterion", stationName: "" };
    case "RideToStationCriterion":
      return { type: "RideToStationCriterion", stationName: "" };
    case "RideLineToStationCriterion":
      return {
        type: "RideLineToStationCriterion",
        lineName: "",
        stationName: "",
      };
    case "RideFromStationCriterion":
      return { type: "RideFromStationCriterion", stationName: "" };
    case "RideLineFromStationCriterion":
      return {
        type: "RideLineFromStationCriterion",
        lineName: "",
        stationName: "",
      };
    case "ConstantCriterion":
      return { type: "ConstantCriterion", value: true, description: "" };
    case "Descriptor":
      return {
        type: "Descriptor",
        base: createDefaultCriterion("ConstantCriterion"),
        description: "",
      };
    case "AndCriterion":
      return { type: "AndCriterion", criteria: [] };
    case "OrCriterion":
      return { type: "OrCriterion", criteria: [] };
    case "NotCriterion":
      return {
        type: "NotCriterion",
        base: createDefaultCriterion("ConstantCriterion"),
        description: "",
      };
    case "SequenceCriterion":
      return { type: "SequenceCriterion", criteria: [] };
    case "LatchingCriterion":
      return {
        type: "LatchingCriterion",
        base: createDefaultCriterion("ConstantCriterion"),
      };
    case "RisingEdgeAndConditionCriterion":
      return {
        type: "RisingEdgeAndConditionCriterion",
        triggerCriteria: createDefaultCriterion("ConstantCriterion"),
        conditionCriteria: createDefaultCriterion("ConstantCriterion"),
      };
    default:
      throw new Error(`Unknown criterion type: ${type}`);
  }
}

export function createDefaultStep(): Step {
  return {
    criteria: createDefaultCriterion("RideToStationCriterion"),
    failureCriteria: undefined,
  };
}

export function criterionTypeLabel(type: CriterionType): string {
  return type.replace("Criterion", "");
}
