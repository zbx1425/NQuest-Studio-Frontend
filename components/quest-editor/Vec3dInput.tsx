"use client";

import { Input, Label } from "@fluentui/react-components";
import type { Vec3d } from "@/lib/types";

interface Vec3dInputProps {
  label: string;
  value: Vec3d;
  onChange: (value: Vec3d) => void;
}

export function Vec3dInput({ label, value, onChange }: Vec3dInputProps) {
  const handleChange = (axis: keyof Vec3d, raw: string) => {
    const num = parseFloat(raw);
    onChange({ ...value, [axis]: isNaN(num) ? 0 : num });
  };

  return (
    <div className="flex flex-col gap-1">
      <Label size="small">{label}</Label>
      <div className="grid grid-cols-3 gap-1">
        <Input
          size="small"
          type="number"
          placeholder="X"
          value={String(value.x)}
          onChange={(_, d) => handleChange("x", d.value)}
        />
        <Input
          size="small"
          type="number"
          placeholder="Y"
          value={String(value.y)}
          onChange={(_, d) => handleChange("y", d.value)}
        />
        <Input
          size="small"
          type="number"
          placeholder="Z"
          value={String(value.z)}
          onChange={(_, d) => handleChange("z", d.value)}
        />
      </div>
    </div>
  );
}
