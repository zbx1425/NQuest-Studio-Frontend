export interface Vec3d {
  x: number
  y: number
  z: number
}

export interface ManualTriggerCriterion {
  type: 'ManualTriggerCriterion'
  id: string
  description: string
}

export interface InBoundsCriterion {
  type: 'InBoundsCriterion'
  min: Vec3d
  max: Vec3d
  description: string
}

export interface OverSpeedCriterion {
  type: 'OverSpeedCriterion'
  maxSpeedMps: number
}

export interface TeleportDetectCriterion {
  type: 'TeleportDetectCriterion'
}

export interface RideLineCriterion {
  type: 'RideLineCriterion'
  lineName: string
}

export interface VisitStationCriterion {
  type: 'VisitStationCriterion'
  stationName: string
}

export interface RideToStationCriterion {
  type: 'RideToStationCriterion'
  stationName: string
}

export interface RideLineToStationCriterion {
  type: 'RideLineToStationCriterion'
  lineName: string
  stationName: string
}

export interface ConstantCriterion {
  type: 'ConstantCriterion'
  value: boolean
  description: string
}

export interface Descriptor {
  type: 'Descriptor'
  base: Criterion,
  description: string
}

export interface AndCriterion {
  type: 'AndCriterion'
  criteria: Criterion[]
}

export interface OrCriterion {
  type: 'OrCriterion'
  criteria: Criterion[]
}

export interface NotCriterion {
  type: 'NotCriterion'
  base: Criterion,
  description: string
}

export interface LatchingCriterion {
  type: 'LatchingCriterion'
  base: Criterion
}

export interface RisingEdgeAndConditionCriterion {
  type: 'RisingEdgeAndConditionCriterion'
  triggerCriteria: Criterion
  conditionCriteria: Criterion
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
  | RisingEdgeAndConditionCriterion

export interface Step {
  criteria: Criterion
  failureCriteria: Criterion | undefined
}

export interface DefaultCriteria {
  failureCriteria: Criterion
}

export interface Quest {
  id: string
  name: string
  description: string
  category: string
  tier: string
  questPoints: number
  defaultCriteria: DefaultCriteria | undefined
  steps: Step[]
}
