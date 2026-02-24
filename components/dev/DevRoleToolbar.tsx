"use client";

import { useDevRole, setDevRole, type DevRole } from "@/lib/hooks/useDevRole";
import { useAuth } from "@/lib/hooks/useAuth";

const ROLES: { value: DevRole; label: string; color: string }[] = [
  { value: "real", label: "Real", color: "bg-gray-600" },
  { value: "admin", label: "Admin", color: "bg-red-600" },
  { value: "author", label: "Author", color: "bg-blue-600" },
  { value: "user", label: "User", color: "bg-green-600" },
  { value: "guest", label: "Guest", color: "bg-yellow-600" },
];

export function DevRoleToolbar() {
  const current = useDevRole();
  const { isLoggedIn, isAdmin, isAuthor } = useAuth();

  if (process.env.NODE_ENV !== "development") return null;

  const effectiveLabel = isAdmin
    ? "admin"
    : isAuthor
      ? "author"
      : isLoggedIn
        ? "user"
        : "guest";

  return (
    <div className="fixed bottom-3 right-3 z-[9999] flex items-center gap-1 rounded-lg border border-gray-300 bg-white/95 shadow-lg backdrop-blur px-2 py-1.5 text-xs font-mono select-none">
      <span className="text-gray-400 mr-1">role:</span>
      {ROLES.map((r) => (
        <button
          key={r.value}
          onClick={() => setDevRole(r.value)}
          className={`px-2 py-0.5 rounded transition-colors ${
            current === r.value
              ? `${r.color} text-white`
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {r.label}
        </button>
      ))}
      <span className="ml-2 text-gray-300">|</span>
      <span className="ml-1 text-gray-400">
        eff: <span className="text-gray-700">{effectiveLabel}</span>
      </span>
    </div>
  );
}
