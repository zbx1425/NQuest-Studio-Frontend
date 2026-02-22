"use client";

import { useCallback, useEffect } from "react";
import {
  Dropdown,
  Option,
  Input,
  Label,
  Button,
  Switch,
  Text,
} from "@fluentui/react-components";
import { DeleteRegular, AddRegular } from "@fluentui/react-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import type { Criterion, CriterionType } from "@/lib/types";
import { CRITERION_TYPES } from "@/lib/types";
import { createDefaultCriterion, criterionTypeLabel } from "@/lib/criterion";
import { Vec3dInput } from "./Vec3dInput";
import { AutocompleteInput } from "./AutocompleteInput";

const BORDER_COLORS = [
  "border-l-blue-400",
  "border-l-purple-400",
  "border-l-cyan-400",
  "border-l-pink-400",
  "border-l-amber-400",
];

interface CriterionEditorProps {
  value: Criterion;
  onChange: (value: Criterion) => void;
  onDelete?: () => void;
  depth?: number;
}

export function CriterionEditor({
  value,
  onChange,
  onDelete,
  depth = 0,
}: CriterionEditorProps) {
  const systemMap = useSelector((state: RootState) => state.systemMap.data);
  const stationItems = systemMap?.stationNamesAndIds ?? [];
  const routeItems = systemMap?.routeNames ?? [];

  // Auto-resolve station names to IDs
  useEffect(() => {
    if (!systemMap) return;
    if (
      value.type === "VisitStationCriterion" ||
      value.type === "RideToStationCriterion" ||
      value.type === "RideLineToStationCriterion"
    ) {
      const name = value.stationName;
      const resolved = systemMap.stationNameToId[name];
      if (resolved && resolved !== name) {
        onChange({ ...value, stationName: resolved });
      }
    }
  }, [value.type]);

  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType && newType !== value.type) {
        onChange(createDefaultCriterion(newType as CriterionType));
      }
    },
    [value.type, onChange]
  );

  const update = useCallback(
    (patch: Partial<Criterion>) => {
      onChange({ ...value, ...patch } as Criterion);
    },
    [value, onChange]
  );

  const borderColor = BORDER_COLORS[depth % BORDER_COLORS.length];

  return (
    <div className={`border-l-3 ${borderColor} pl-3 py-2 space-y-2`}>
      {/* Header: type selector + delete */}
      <div className="flex items-center gap-2">
        <Dropdown
          size="small"
          value={criterionTypeLabel(value.type)}
          selectedOptions={[value.type]}
          onOptionSelect={(_, d) => handleTypeChange(d.optionValue ?? "")}
          className="min-w-[180px]"
        >
          {CRITERION_TYPES.map((t) => (
            <Option key={t} value={t}>
              {criterionTypeLabel(t)}
            </Option>
          ))}
        </Dropdown>

        <div className="flex-1" />

        {onDelete && (
          <Button
            appearance="subtle"
            icon={<DeleteRegular />}
            size="small"
            onClick={onDelete}
            title="Remove"
          />
        )}
      </div>

      {/* Type-specific fields */}
      {value.type === "VisitStationCriterion" && (
        <AutocompleteInput
          label="Station Name"
          value={value.stationName}
          onChange={(v) => update({ stationName: v })}
          items={stationItems}
          placeholder="Select a station"
        />
      )}

      {value.type === "RideToStationCriterion" && (
        <AutocompleteInput
          label="Station Name"
          value={value.stationName}
          onChange={(v) => update({ stationName: v })}
          items={stationItems}
          placeholder="Select a station"
        />
      )}

      {value.type === "RideLineCriterion" && (
        <AutocompleteInput
          label="Line Name"
          value={value.lineName}
          onChange={(v) => update({ lineName: v })}
          items={routeItems}
          placeholder="Select a route"
        />
      )}

      {value.type === "RideLineToStationCriterion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <AutocompleteInput
            label="Line Name"
            value={value.lineName}
            onChange={(v) => update({ lineName: v })}
            items={routeItems}
            placeholder="Select a route"
          />
          <AutocompleteInput
            label="Station Name"
            value={value.stationName}
            onChange={(v) => update({ stationName: v })}
            items={stationItems}
            placeholder="Select a station"
          />
        </div>
      )}

      {value.type === "InBoundsCriterion" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Vec3dInput
              label="Minimum Coordinates"
              value={value.min}
              onChange={(v) => update({ min: v })}
            />
            <Vec3dInput
              label="Maximum Coordinates"
              value={value.max}
              onChange={(v) => update({ max: v })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label size="small">Description</Label>
            <Input
              size="small"
              value={value.description}
              onChange={(_, d) => update({ description: d.value })}
            />
          </div>
        </>
      )}

      {value.type === "OverSpeedCriterion" && (
        <div className="flex flex-col gap-1">
          <Label size="small">Max Speed (m/s)</Label>
          <Input
            size="small"
            type="number"
            value={String(value.maxSpeedMps)}
            onChange={(_, d) =>
              update({ maxSpeedMps: parseFloat(d.value) || 0 })
            }
          />
        </div>
      )}

      {value.type === "TeleportDetectCriterion" && (
        <Text size={200} className="text-gray-500">
          Triggered when a player moves more than 166 meters in one second (~600km/h).
        </Text>
      )}

      {value.type === "ManualTriggerCriterion" && (
        <>
          <Text size={200}>
            ID: <code className="bg-gray-100 px-1 rounded text-xs">{value.id}</code>
          </Text>
          <div className="flex flex-col gap-1">
            <Label size="small">Description</Label>
            <Input
              size="small"
              value={value.description}
              onChange={(_, d) => update({ description: d.value })}
              placeholder="Describe how to manually trigger this step."
            />
          </div>
        </>
      )}

      {value.type === "ConstantCriterion" && (
        <div className="space-y-2">
          <Switch
            checked={value.value}
            onChange={(_, d) => update({ value: d.checked })}
            label="Value"
          />
          <div className="flex flex-col gap-1">
            <Label size="small">Description</Label>
            <Input
              size="small"
              value={value.description}
              onChange={(_, d) => update({ description: d.value })}
            />
          </div>
        </div>
      )}

      {value.type === "Descriptor" && (
        <>
          <div className="flex flex-col gap-1">
            <Label size="small">Base Condition</Label>
            <CriterionEditor
              value={value.base}
              onChange={(base) => onChange({ ...value, base })}
              depth={depth + 1}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label size="small">Description (overwrites base description)</Label>
            <Input
              size="small"
              value={value.description}
              onChange={(_, d) => update({ description: d.value })}
            />
          </div>
        </>
      )}

      {(value.type === "AndCriterion" || value.type === "OrCriterion") && (
        <div className="space-y-2">
          <Label size="small">Conditions</Label>
          {value.criteria.map((child, index) => (
            <CriterionEditor
              key={index}
              value={child}
              onChange={(newChild) => {
                const updated = [...value.criteria];
                updated[index] = newChild;
                onChange({ ...value, criteria: updated });
              }}
              onDelete={() => {
                const updated = value.criteria.filter((_, i) => i !== index);
                onChange({ ...value, criteria: updated });
              }}
              depth={depth + 1}
            />
          ))}
          <Button
            size="small"
            icon={<AddRegular />}
            onClick={() =>
              onChange({
                ...value,
                criteria: [
                  ...value.criteria,
                  createDefaultCriterion("InBoundsCriterion"),
                ],
              })
            }
          >
            Add Condition
          </Button>
        </div>
      )}

      {value.type === "NotCriterion" && (
        <>
          <div className="flex flex-col gap-1">
            <Label size="small">Base Condition</Label>
            <CriterionEditor
              value={value.base}
              onChange={(base) => onChange({ ...value, base })}
              depth={depth + 1}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label size="small">Description (overwrites base description)</Label>
            <Input
              size="small"
              value={value.description}
              onChange={(_, d) => update({ description: d.value })}
            />
          </div>
        </>
      )}

      {value.type === "LatchingCriterion" && (
        <div className="flex flex-col gap-1">
          <Label size="small">Base Condition</Label>
          <CriterionEditor
            value={value.base}
            onChange={(base) => onChange({ ...value, base })}
            depth={depth + 1}
          />
        </div>
      )}

      {value.type === "RisingEdgeAndConditionCriterion" && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <Label size="small">Trigger Condition</Label>
            <CriterionEditor
              value={value.triggerCriteria}
              onChange={(triggerCriteria) =>
                onChange({ ...value, triggerCriteria })
              }
              depth={depth + 1}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label size="small">Condition</Label>
            <CriterionEditor
              value={value.conditionCriteria}
              onChange={(conditionCriteria) =>
                onChange({ ...value, conditionCriteria })
              }
              depth={depth + 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}
