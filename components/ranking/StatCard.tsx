import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  iconBg?: string;
}

export function StatCard({
  icon,
  value,
  label,
  iconBg = "bg-blue-100 text-blue-600",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col items-start gap-2">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
