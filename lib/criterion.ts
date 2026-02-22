import { v4 as uuidv4 } from "uuid";
import type { Criterion, CriterionType, Step } from "./types";

export function createDefaultCriterion(type: CriterionType): Criterion {
  switch (type) {
    case "ManualTriggerCriterion":
      return { type: "ManualTriggerCriterion", id: uuidv4(), description: "" };
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
